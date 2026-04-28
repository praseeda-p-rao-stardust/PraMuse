import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { SwapsService } from './swaps.service';

@Controller('swaps')
export class SwapsController {
  constructor(private readonly swapsService: SwapsService) {}

  @Get()
  findAll(@Query('userId') userId: string) {
    return this.swapsService.findAll(userId);
  }

  @Post()
  create(@Body() body: any) {
    return this.swapsService.create(body);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: "ACCEPTED" | "REJECTED" | "COMPLETED") {
    return this.swapsService.updateStatus(id, status);
  }
}
