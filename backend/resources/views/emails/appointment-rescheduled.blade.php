@component('mail::message')
# Appointment Rescheduled

{!! nl2br(e($content)) !!}

@component('mail::button', ['url' => route('patient.dashboard')])
View Your Appointments
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent