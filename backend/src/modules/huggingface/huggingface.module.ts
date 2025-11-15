import { Module } from "@nestjs/common";
import { HuggingfaceService } from "./huggingface.service";
import { HuggingfaceController } from "./huggingface.controller";

@Module({
  controllers: [HuggingfaceController],
  providers: [HuggingfaceService],
})
export class HuggingfaceModule {}
