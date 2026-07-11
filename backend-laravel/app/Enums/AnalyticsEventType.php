<?php

namespace App\Enums;

enum AnalyticsEventType: string
{
    case PageView = 'page_view';
    case OutboundClick = 'outbound_click';
    case FormCompletion = 'form_completion';
}
