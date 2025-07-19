<!DOCTYPE html>
<html>
<head>
    <title>Pre-Registration Details</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .header { text-align: center; margin-bottom: 20px; }
        .logo { width: 150px; }
        .title { font-size: 24px; font-weight: bold; }
        .details { margin-top: 30px; }
        .detail-row { margin-bottom: 10px; }
        .label { font-weight: bold; display: inline-block; width: 180px; }
        .footer { margin-top: 50px; font-size: 12px; text-align: center; }
        .note { margin-top: 30px; padding: 15px; background-color: #f5f5f5; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Healthcare Provider Pre-Registration</div>
        <div>CAPD System</div>
    </div>
    
    <div class="details">
        <div class="detail-row">
            <span class="label">Registration Number:</span>
            <span>{{ $user->reg_number }}</span>
        </div>
        <div class="detail-row">
            <span class="label">Employee Number:</span>
            <span>{{ $user->employeeNumber }}</span>
        </div>
        <div class="detail-row">
            <span class="label">Name:</span>
            <span>{{ $user->first_name }} {{ $user->last_name }}</span>
        </div>
        <div class="detail-row">
            <span class="label">Email:</span>
            <span>{{ $user->email }}</span>
        </div>
        <div class="detail-row">
            <span class="label">User Level:</span>
            <span>{{ $user->custom_user_level ?? $user->userLevel }}</span>
        </div>
        <div class="detail-row">
            <span class="label">Temporary Password:</span>
            <span>{{ $password }}</span>
        </div>
    </div>
    
    <div class="note">
        <strong>Important:</strong> Please complete your registration by visiting our system and using the credentials above. 
        You will be required to provide additional information and change your password upon first login.
    </div>
    
    <div class="footer">
        Generated on {{ now()->format('Y-m-d H:i:s') }} | CAPD Healthcare System
    </div>
</body>
</html>