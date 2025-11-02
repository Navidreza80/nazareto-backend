import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/gards/jwt-auth.gaurd';
import { CreatePollDto } from './dtos/create-poll.dto';
import { UpdatePollDto } from './dtos/update-poll.dto';
import { VoteDto } from './dtos/vote.dto';
import { PollsService } from './polls.service';

@ApiTags('Polls')
@Controller('polls')
export class PollsController {
    constructor(private readonly pollsService: PollsService) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Post()
    createPoll(@Req() req, @Body() dto: CreatePollDto) {
        return this.pollsService.createPoll(req.user.userId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Patch(':id')
    updatePoll(@Req() req, @Param('id') id: string, @Body() dto: UpdatePollDto) {
        return this.pollsService.updatePoll(req.user.userId, +id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Delete(':id')
    deletePoll(@Req() req, @Param('id') id: string) {
        return this.pollsService.deletePoll(req.user.userId, +id);
    }

    @Get()
    getAllPolls() {
        return this.pollsService.getAllPolls();
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Get(':id')
    getPoll(@Param('id') id: string, @Req() req) {
        const userId = req.user.userId;
        return this.pollsService.getPollById(+id, userId);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @Post('vote')
    async vote(@Req() req, @Body() dto: VoteDto) {
        const userId = req.user.userId;
        return this.pollsService.vote(userId, dto);
    }
}
