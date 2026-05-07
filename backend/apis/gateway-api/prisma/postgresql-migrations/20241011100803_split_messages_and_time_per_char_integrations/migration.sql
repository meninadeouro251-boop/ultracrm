-- AlterTable
ALTER TABLE "Dify" ADD COLUMN     "splitMessages" BOOLEAN DEFAULT false,
ADD COLUMN     "timePerChar" INTEGER DEFAULT 50;

-- AlterTable
ALTER TABLE "DifySetting" ADD COLUMN     "splitMessages" BOOLEAN DEFAULT false,
ADD COLUMN     "timePerChar" INTEGER DEFAULT 50;

-- AlterTable
ALTER TABLE "ultralutionBot" ADD COLUMN     "splitMessages" BOOLEAN DEFAULT false,
ADD COLUMN     "timePerChar" INTEGER DEFAULT 50;

-- AlterTable
ALTER TABLE "ultralutionBotSetting" ADD COLUMN     "splitMessages" BOOLEAN DEFAULT false,
ADD COLUMN     "timePerChar" INTEGER DEFAULT 50;

-- AlterTable
ALTER TABLE "Flowise" ADD COLUMN     "splitMessages" BOOLEAN DEFAULT false,
ADD COLUMN     "timePerChar" INTEGER DEFAULT 50;

-- AlterTable
ALTER TABLE "FlowiseSetting" ADD COLUMN     "splitMessages" BOOLEAN DEFAULT false,
ADD COLUMN     "timePerChar" INTEGER DEFAULT 50;

-- AlterTable
ALTER TABLE "OpenaiBot" ADD COLUMN     "splitMessages" BOOLEAN DEFAULT false,
ADD COLUMN     "timePerChar" INTEGER DEFAULT 50;

-- AlterTable
ALTER TABLE "OpenaiSetting" ADD COLUMN     "splitMessages" BOOLEAN DEFAULT false,
ADD COLUMN     "timePerChar" INTEGER DEFAULT 50;
