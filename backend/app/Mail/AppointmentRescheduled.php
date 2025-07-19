<?php

namespace App\Mail;

use App\Models\Schedule;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AppointmentRescheduled extends Mailable
{
    use Queueable, SerializesModels;

    public $schedule;
    public $emailContent;

    public function __construct(Schedule $schedule, $emailContent)
    {
        $this->schedule = $schedule;
        $this->emailContent = $emailContent;
    }

    public function build()
    {
        return $this->subject('Your Appointment Has Been Rescheduled')
                    ->markdown('emails.appointment-rescheduled')
                    ->with([
                        'schedule' => $this->schedule,
                        'content' => $this->emailContent
                    ]);
    }
}