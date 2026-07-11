<?php

namespace App\Enums;

enum PriceType: string
{
    case Free = 'free';
    case Paid = 'paid';
    case Donation = 'donation';
}
