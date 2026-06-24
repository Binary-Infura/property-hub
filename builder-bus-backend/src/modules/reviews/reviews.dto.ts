import { IsString, IsInt, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateReviewDto {
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @IsString()
    @IsNotEmpty()
    authorRole: string;
}
