<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Medical Prescription</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #3b82f6;
            margin-bottom: 5px;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .patient-info, .doctor-info {
            display: inline-block;
            width: 48%;
            vertical-align: top;
            margin-bottom: 20px;
        }
        .doctor-info {
            text-align: right;
        }
        .info-label {
            font-weight: bold;
            color: #3b82f6;
        }
        .prescription-date {
            text-align: right;
            margin-bottom: 20px;
            color: #666;
        }
        .medications {
            margin: 30px 0;
        }
        .medication {
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px dashed #ddd;
        }
        .med-name {
            font-weight: bold;
            font-size: 1.1em;
        }
        .med-details {
            margin-left: 20px;
            margin-top: 5px;
        }
        .instructions {
            margin-top: 30px;
            padding: 15px;
            background-color: #f8fafc;
            border-left: 4px solid #3b82f6;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 0.9em;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        .signature {
            margin-top: 50px;
            text-align: right;
        }
        .signature-line {
            display: inline-block;
            width: 200px;
            border-top: 1px solid #333;
            margin-top: 40px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>MEDICAL PRESCRIPTION</h1>
        <p>This is an official medical document</p>
    </div>

    <div class="patient-info">
        <p><span class="info-label">Patient:</span> {{ $patient->user->first_name }} {{ $patient->user->last_name }}</p>
        <p><span class="info-label">Patient ID:</span> {{ $patient->patientID }}</p>
        <p><span class="info-label">Date of Birth:</span> {{ \Carbon\Carbon::parse($patient->user->date_of_birth)->format('F j, Y') }}</p>
    </div>

    <div class="doctor-info">
        <p><span class="info-label">Doctor:</span> Dr. {{ $doctor->first_name }} {{ $doctor->last_name }}</p>
        <p><span class="info-label">License:</span> {{ $doctor->medical_license ?? 'N/A' }}</p>
    </div>

    <div class="prescription-date">
        <p><span class="info-label">Date:</span> {{ $date }}</p>
    </div>

    <div class="medications">
        <h2 style="color: #3b82f6; border-bottom: 1px solid #3b82f6; padding-bottom: 5px;">Medications Prescribed</h2>
        
        @foreach($medicines as $med)
        <div class="medication">
            <div class="med-name">{{ $med['name'] }} ({{ $med['generic_name'] }})</div>
            <div class="med-details">
                <p><span class="info-label">Dosage:</span> {{ $med['dosage'] }}</p>
                <p><span class="info-label">Frequency:</span> {{ $med['frequency'] }}</p>
                <p><span class="info-label">Duration:</span> {{ $med['duration'] }}</p>
            </div>
        </div>
        @endforeach
    </div>

    @if($additional_instructions)
    <div class="instructions">
        <h3 style="margin-top: 0; color: #3b82f6;">Additional Instructions</h3>
        <p>{{ $additional_instructions }}</p>
    </div>
    @endif

    <div class="signature">
        <div class="signature-line"></div>
        <p>Dr. {{ $doctor->first_name }} {{ $doctor->last_name }}</p>
    </div>

    <div class="footer">
        <p>This is a computer-generated document. No physical signature is required.</p>
        <p>For any questions, please contact the prescribing physician.</p>
    </div>
</body>
</html>