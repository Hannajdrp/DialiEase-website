<!DOCTYPE html>
<html>
<head>
    <title>Medical Prescription</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .header { text-align: center; margin-bottom: 20px; }
        .patient-info { margin-bottom: 30px; }
        .section-title { font-weight: bold; margin: 15px 0 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .footer { margin-top: 50px; text-align: right; }
    </style>
</head>
<body>
    <div class="header">
        <h2>MEDICAL PRESCRIPTION</h2>
        <p>Date: {{ $date }}</p>
    </div>

    <div class="patient-info">
        <h3>Patient Information</h3>
        <p><strong>Name:</strong> {{ $patient->name ?? '' }}</p>
        <p><strong>Hospital Number:</strong> {{ $patient->hospital_number ?? '' }}</p>
    </div>

    <div class="medicines-section">
        <h3 class="section-title">Prescribed Medications</h3>
        <table>
            <thead>
                <tr>
                    <th>No.</th>
                    <th>Medicine Name</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                </tr>
            </thead>
            <tbody>
                @foreach($medicines as $index => $medicine)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $medicine['name'] }}</td>
                    <td>{{ $medicine['dosage'] }}</td>
                    <td>{{ $medicine['frequency'] }}</td>
                    <td>{{ $medicine['duration'] }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    @if(!empty($pdData))
    <div class="pd-section">
        <h3 class="section-title">PD Solution Information</h3>
        <p><strong>System:</strong> {{ $pdData['system'] ?? '' }}</p>
        <p><strong>Total Exchanges:</strong> {{ $pdData['totalExchanges'] ?? '' }}</p>
        <p><strong>Dwell Time:</strong> {{ $pdData['dwellTime'] ?? '' }} hours</p>
        
        <table>
            <thead>
                <tr>
                    <th>Dwell Time</th>
                    <th>1st</th>
                    <th>2nd</th>
                    <th>3rd</th>
                    <th>4th</th>
                    <th>5th</th>
                    <th>6th</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{ $pdData['dwellTime'] ?? '' }} hours</td>
                    <td>{{ $pdData['first'] ?? '' }}</td>
                    <td>{{ $pdData['second'] ?? '' }}</td>
                    <td>{{ $pdData['third'] ?? '' }}</td>
                    <td>{{ $pdData['fourth'] ?? '' }}</td>
                    <td>{{ $pdData['fifth'] ?? '' }}</td>
                    <td>{{ $pdData['sixth'] ?? '' }}</td>
                </tr>
            </tbody>
        </table>
        
        @if(!empty($pdData['bags']))
        <h4>Solutions</h4>
        <ul>
            @foreach($pdData['bags'] as $bag)
            <li>{{ $bag['percentage'] ? $bag['percentage'].'% - ' : '' }}{{ $bag['count'] }}</li>
            @endforeach
        </ul>
        @endif
    </div>
    @endif

    @if(!empty($additionalInstructions))
    <div class="instructions-section">
        <h3 class="section-title">Additional Instructions</h3>
        <p>{{ $additionalInstructions }}</p>
    </div>
    @endif

    <div class="footer">
        <p>_________________________</p>
        <p>Doctor's Signature</p>
    </div>
</body>
</html>