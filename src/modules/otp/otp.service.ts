import {InjectQueue} from '@nestjs/bullmq';
import {Injectable, BadRequestException, NotFoundException, Inject, forwardRef} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Queue} from 'bullmq';
import {Model} from 'mongoose';

import {OTP} from '../../core/database/schemas/otp/otp.schema';
import {ProjectService} from '../projects/service/project.service';
import configuration from '../../core/IConfiguraion/configuration';

@Injectable()
export class OtpService {
  private readonly configuration = configuration();

  constructor(
    @InjectModel(OTP.name) private otpModel: Model<OTP>,
    @InjectQueue('otp') private otpQueue: Queue,
    @Inject(forwardRef(() => ProjectService))
    private projectService: ProjectService,
  ) { }

  /**
   * Generate OTP for a specific project
   */
  async generateOTP(
    projectId: string, 
    target: string, 
    channel: 'email' | 'whatsapp',
    recordId?: string,
    countryCode?: string
  ) {
    // Verify project exists and is active
    const project = await this.projectService.getProjectByProjectId(projectId);
    
    if (!project.isActive) {
      throw new BadRequestException('Project is inactive');
    }

    // Check if project has sufficient tokens
    if (!project.hasUnlimitedTokens && project.remainingTokens <= 0) {
      throw new BadRequestException('Insufficient tokens');
    }

    // Generate OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expirationTime = this.configuration.otpKeys.expiration || 300; // Default 5 minutes
    const expiresAt = new Date(Date.now() + expirationTime * 1000);

    // Create OTP record with project reference
    const otpRecord = await this.otpModel.create({
      code,
      target,
      channel,
      expiresAt,
      projectId,
      projectObjectId: project.id as any, // Use the string ID from IProjectResponse
      recordId,
      countryCode
    });

    // Queue OTP for sending with project-specific templates
    await this.otpQueue.add('send-otp', {
      target,
      code,
      channel,
      projectId,
      projectData: {
        emailTemplate: project.emailTemplate,
        whatsappTemplate: project.whatsappTemplate,
        isProduction: project.isProduction
      }
    });

    // Consume a token if not unlimited
    if (!project.hasUnlimitedTokens) {
      await this.projectService.consumeToken(projectId);
    }

    return {
      message: 'OTP generated and queued',
      expiresIn: expirationTime,
      recordId: otpRecord._id
    };
  }

  /**
   * Verify OTP for a specific project
   */
  async verifyOTP(projectId: string, target: string, code: string, recordId?: string) {
    // Build query
    const query: any = {
      projectId,
      target,
      code,
      verified: false
    };

    if (recordId) {
      query.recordId = recordId;
    }

    const record = await this.otpModel.findOne(query);
    
    if (!record) {
      return {
        valid: false,
        reason: 'Invalid code or record not found'
      };
    }

    if (new Date() > record.expiresAt) {
      return {
        valid: false,
        reason: 'Code has expired'
      };
    }

    // Mark as verified
    record.verified = true;
    await record.save();

    return {
      valid: true,
      recordId: record._id,
      verifiedAt: new Date()
    };
  }

  /**
   * Get OTP records for a project (admin/analytics)
   */
  async getOTPRecords(
    projectId: string,
    page: number = 1,
    limit: number = 10,
    filters?: {
      channel?: 'email' | 'whatsapp';
      verified?: boolean;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ) {
    const query: any = { projectId };

    if (filters) {
      if (filters.channel) query.channel = filters.channel;
      if (typeof filters.verified === 'boolean') query.verified = filters.verified;
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = filters.dateFrom;
        if (filters.dateTo) query.createdAt.$lte = filters.dateTo;
      }
    }

    const skip = (page - 1) * limit;
    
    const [records, total] = await Promise.all([
      this.otpModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-code') // Don't return actual codes for security
        .exec(),
      this.otpModel.countDocuments(query)
    ]);

    return {
      records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get OTP statistics for a project
   */
  async getOTPStats(projectId: string, dateFrom?: Date, dateTo?: Date) {
    const query: any = { projectId };
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = dateFrom;
      if (dateTo) query.createdAt.$lte = dateTo;
    }

    const [total, verified, byChannel] = await Promise.all([
      this.otpModel.countDocuments(query),
      this.otpModel.countDocuments({ ...query, verified: true }),
      this.otpModel.aggregate([
        { $match: query },
        { $group: { _id: '$channel', count: { $sum: 1 } } }
      ])
    ]);

    return {
      total,
      verified,
      unverified: total - verified,
      verificationRate: total > 0 ? (verified / total * 100).toFixed(2) : 0,
      byChannel: byChannel.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };
  }

  /**
   * Clean up expired OTPs for a project
   */
  async cleanupExpiredOTPs(projectId?: string) {
    const query: any = {
      expiresAt: { $lt: new Date() },
      verified: false
    };

    if (projectId) {
      query.projectId = projectId;
    }

    const result = await this.otpModel.deleteMany(query);
    return {
      deletedCount: result.deletedCount
    };
  }
}
