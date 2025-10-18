import { IsInt, Min, Max } from 'class-validator';

export class ChangeRequestDto {
  @IsInt({ message: 'Amount must be an integer.' })
  @Min(11, { message: 'Amount must be a minimum of 11.' })
  @Max(1000, { message: 'Amount must be a maximum of 1000.' })
  amount: number;
}