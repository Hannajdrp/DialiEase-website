<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Prescription #{{ $prescription->id }}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #395886; padding-bottom: 10px; }
        .header h1 { color: #395886; margin-bottom: 5px; }
        .header p { margin: 0; color: #666; }
        .content { padding: 20px; }
        .section { margin-bottom: 20px; }
        .section-title { color: #395886; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px; }
        .patient-info, .doctor-info { display: inline-block; vertical-align: top; width: 48%; }
        .doctor-info { text-align: right; }
        .medicines-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .medicines-table th { background-color: #f8fafc; text-align: left; padding: 8px; border: 1px solid #ddd; }
        .medicines-table td { padding: 8px; border: 1px solid #ddd; }
        .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee; text-align: center; font-size: 0.8em; color: #666; }
        .signature { margin-top: 50px; }
        .signature-line { width: 300px; border-top: 1px solid #333; margin: 0 auto; }
        .signature-text { text-align: center; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Medical Prescription</h1>
        <p>Prescription #{{ $prescription->id }} | Date: {{ $date }}</p>
    </div>
    
    <div class="content">
        <div class="section">
            <div class="patient-info">
                <strong>Patient:</strong> {{ $patient->user->first_name }} {{ $patient->user->last_name }}<br>
                <strong>HN:</strong> {{ $patient->hospitalNumber }}<br>
                <strong>Date of Birth:</strong> {{ $patient->user->date_of_birth ? \Carbon\Carbon::parse($patient->user->date_of_birth)->format('m/d/Y') : 'N/A' }}
            </div>
            <div class="doctor-info">
                <strong>Prescribed By:</strong><br>
                Dr. {{ $doctor->first_name }} {{ $doctor->last_name }}<br>
                {{ $doctor->specialization }}<br>
                License: {{ $doctor->reg_number }}
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Medications</div>
            <table class="medicines-table">
                <thead>
                    <tr>
                        <th>Medicine</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                        <th>Instructions</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($medicines as $medicine)
                    <tr>
                        <td>{{ $medicine->name }}</td>
                        <td>{{ $medicine->pivot->dosage }}</td>
                        <td>{{ $medicine->pivot->frequency }}</td>
                        <td>{{ $medicine->pivot->duration }}</td>
                        <td>{{ $medicine->pivot->instructions ?: 'None' }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        
        @if($prescription->additional_instructions)
        <div class="section">
            <div class="section-title">Additional Instructions</div>
            <p>{{ $prescription->additional_instructions }}</p>
        </div>
        @endif
        
        <div class="footer">
            <div class="signature">
                <div class="signature-line"></div>
                <div class="signature-text">Dr. {{ $doctor->first_name }} {{ $doctor->last_name }}</div>
            </div>
            <p>This is a computer-generated prescription. No signature is required.</p>
        </div>
    </div>
</body>
</html>