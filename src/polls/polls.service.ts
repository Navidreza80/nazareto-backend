import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePollDto } from './dtos/create-poll.dto';
import { UpdatePollDto } from './dtos/update-poll.dto';
import { VoteDto } from './dtos/vote.dto';

@Injectable()
export class PollsService {
  constructor(private prisma: PrismaService) { }

  async createPoll(adminId: number, dto: CreatePollDto) {
    return this.prisma.poll.create({
      data: {
        question: dto.question,
        createdById: adminId,
        options: {
          create: dto.options.map((text) => ({ text })),
        },
      },
      include: { options: true },
    });
  }

  async getAllPolls() {
    return this.prisma.poll.findMany({
      where: { isActive: true },
      include: { options: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPollById(pollId: number, userId?: number) {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true },
    });

    if (!poll) throw new NotFoundException('Poll not found');

    let userVote: null | { optionId: Number, text: String } = null;

    if (userId) {
      const vote = await this.prisma.vote.findUnique({
        where: { userId_pollId: { userId, pollId } },
        include: { option: true },
      });

      if (vote) {
        userVote = { optionId: vote.option.id, text: vote.option.text };
      }
    }

    return { ...poll, userVote };
  }

  async updatePoll(adminId: number, id: number, dto: UpdatePollDto) {
    const poll = await this.prisma.poll.findUnique({ where: { id } });
    if (!poll) throw new NotFoundException('Poll not found');
    if (poll.createdById !== adminId)
      throw new ForbiddenException('You can only update your own polls');

    return this.prisma.poll.update({
      where: { id },
      data: dto,
    });
  }

  async deletePoll(adminId: number, id: number) {
    const poll = await this.prisma.poll.findUnique({ where: { id } });
    if (!poll) throw new NotFoundException('Poll not found');
    if (poll.createdById !== adminId)
      throw new ForbiddenException('You can only delete your own polls');

    return this.prisma.poll.delete({ where: { id } });
  }

  async vote(userId: number, dto: VoteDto) {
    const { optionId, pollId } = dto;

    const option = await this.prisma.option.findUnique({ where: { id: optionId } });
    if (!option) throw new NotFoundException('Option not found');

    const poll = await this.prisma.poll.findUnique({ where: { id: pollId } });
    if (!poll || !poll.isActive)
      throw new NotFoundException('Poll not found or inactive');

    const existingVote = await this.prisma.vote.findUnique({
      where: { userId_pollId: { userId, pollId } },
    });
    if (existingVote) throw new ForbiddenException('Already voted');

    await this.prisma.$transaction([
      this.prisma.vote.create({
        data: { userId, pollId, optionId },
      }),
      this.prisma.option.update({
        where: { id: optionId },
        data: { totalVotes: { increment: 1 } },
      }),
      this.prisma.poll.update({
        where: { id: pollId },
        data: { totalVotes: { increment: 1 } },
      }),
    ]);

    const updatedPoll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: { include: { votes: true } } },
    });

    return updatedPoll;
  }

}
