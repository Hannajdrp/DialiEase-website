import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FaPills, FaTimes, FaInfoCircle, 
  FaUserInjured, FaHospital, FaQuestionCircle, 
  FaPlus, FaFilePdf, FaCheckCircle 
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import ShowPrescribeModal from './ShowPrescribeModal';

const DetailsContainer = styled.div`
  --color-primary: #4f46e5;
  --color-primary-light: #6366f1;
  --color-secondary: #10b981;
  --color-white: #ffffff;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-400: #9ca3af;
  --color-gray-600: #4b5563;
  --color-gray-800: #1f2937;
  --color-error: #ef4444;
  --color-success: #10b981;
  
  display: flex;
  flex-direction: column;
  gap: 2rem;
  height: 100%;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  color: var(--color-gray-800);
  margin: 0;
  font-weight: 600;
`;

const SectionSubtitle = styled.p`
  font-size: 0.85rem;
  color: var(--color-gray-600);
  margin: 0;
`;

const PatientInfoCard = styled.div`
  background-color: var(--color-gray-50);
  padding: 1.2rem;
  border-radius: 8px;
  border: 1px solid var(--color-gray-200);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  flexDirection: 'column',
  gap: '0.2rem'
`;

const InfoLabel = styled.span`
  font-size: 0.8rem;
  color: var(--color-gray-600);
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const InfoValue = styled.span`
  font-size: 0.95rem;
  color: var(--color-gray-800);
  font-weight: 500;
`;

const MedicinesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 0.5rem;
`;

const MedicineCard = styled.div`
  background-color: var(--color-white);
  border-radius: 8px;
  padding: 1.2rem;
  border: 1px solid var(--color-gray-200);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: 0 2px 6px rgba(79, 70, 229, 0.1);
  }
`;

const MedicineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const MedicineTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const MedicineNumber = styled.span`
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.9rem;
`;

const MedicineName = styled.span`
  font-weight: 600;
  color: var(--color-gray-800);
  font-size: 1rem;
`;

const MedicineGeneric = styled.p`
  font-size: 0.85rem;
  color: var(--color-gray-600);
  margin: 0 0 0.8rem 1.4rem;
`;

const RemoveButton = styled.button`
  background-color: transparent;
  color: var(--color-error);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background-color: #fee2e2;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 1rem;
  position: relative;
`;

const InputLabel = styled.label`
  font-size: 0.9rem;
  color: var(--color-gray-800);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const InputHint = styled.span`
  font-size: 0.8rem;
  color: var(--color-gray-600);
`;

const ErrorMessage = styled.span`
  font-size: 0.8rem;
  color: var(--color-error);
  margin-top: 0.2rem;
`;

const InfoTooltip = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;

  &:hover > div {
    visibility: visible;
    opacity: 1;
  }
`;

const TooltipContent = styled.div`
  visibility: hidden;
  width: 200px;
  background-color: var(--color-gray-800);
  color: var(--color-white);
  text-align: center;
  border-radius: 6px;
  padding: 0.5rem;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 0.8rem;
  font-weight: normal;

  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: var(--color-gray-800) transparent transparent transparent;
  }
`;

const InputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const InputField = styled.input`
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1px solid var(--color-gray-200);
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background-color: var(--color-white);

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  &.error {
    border-color: var(--color-error);
  }
`;

const DropdownList = styled.ul`
  position: absolute;
  width: 100%;
  max-height: 180px;
  overflow-y: auto;
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: 6px;
  margin-top: 0.3rem;
  padding: 0.3rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  list-style: none;
`;

const DropdownItem = styled.li`
  padding: 0.6rem 1rem;
  cursor: pointer;
  transition: all 0.1s ease;
  font-size: 0.9rem;
  color: var(--color-gray-800);

  &:hover {
    background-color: var(--color-gray-50);
    color: var(--color-primary);
  }
`;

const InstructionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const InstructionsTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 0.8rem;
  border: 1px solid var(--color-gray-200);
  border-radius: 6px;
  font-size: 0.9rem;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  &.error {
    border-color: var(--color-error);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  background-color: var(--color-gray-50);
  border-radius: 8px;
  border: 1px dashed var(--color-gray-200);
`;

const EmptyIcon = styled.div`
  color: var(--color-gray-400);
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  margin: 0;
  color: var(--color-gray-600);
  font-size: 0.95rem;
`;

const QuickPresets = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
`;

const PresetButton = styled.button`
  background-color: var(--color-gray-100);
  color: var(--color-gray-800);
  border: none;
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--color-gray-200);
  }
`;

const PdSection = styled(Section)`
  background-color: var(--color-gray-50);
  padding: 1.2rem;
  border-radius: 8px;
  border: 1px solid var(--color-gray-200);
`;

const PdInputGroup = styled(InputGroup)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const PdInputField = styled(InputField)`
  width: 100%;
`;

const PdTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
`;

const PdTh = styled.th`
  background-color: var(--color-gray-100);
  padding: 0.5rem;
  text-align: center;
  border: 1px solid var(--color-gray-200);
`;

const PdTd = styled.td`
  padding: 0.5rem;
  text-align: center;
  border: 1px solid var(--color-gray-200);
  position: relative;
`;

const PdError = styled.div`
  position: absolute;
  bottom: -18px;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 0.7rem;
  color: var(--color-error);
`;

const BagInputContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const BagInput = styled(InputField)`
  flex: 1;
`;

const AddBagButton = styled.button`
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BagItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: var(--color-gray-100);
  border-radius: 4px;
  margin-bottom: 0.5rem;
`;

const RemoveBagButton = styled.button`
  background-color: var(--color-error);
  color: white;
  border: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const SaveButton = styled.button`
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(79, 70, 229, 0.3);

  &:hover {
    background-color: var(--color-primary-light);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-success);
  font-weight: 500;
  margin-top: 1rem;
`;

const dosageOptions = [
  '1 tablet', '2 tablets', '1/2 tablet', '1 capsule', 
  '5mg', '10mg', '20mg', '50mg', '100mg', '250mg', '500mg',
  '1 teaspoon', '2 teaspoons', '5ml', '10ml', '15ml'
];

const frequencyOptions = [
  'Once daily', 'Twice daily', 'Three times daily', 'Four times daily',
  'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours',
  'Before meals', 'After meals', 'At bedtime', 'As needed'
];

const durationOptions = [
  '1 day', '3 days', '5 days', '7 days', '10 days', '14 days',
  '21 days', '1 month', '2 months', '3 months', 'Until finished',
  'As directed'
];

const commonPresets = [
  { name: 'Standard Adult', dosage: '1 tablet', frequency: 'Twice daily', duration: '7 days' },
  { name: 'Pediatric', dosage: '1/2 tablet', frequency: 'Twice daily', duration: '5 days' },
  { name: 'Acute Pain', dosage: '1 tablet', frequency: 'Every 6 hours', duration: '3 days' },
  { name: 'Chronic', dosage: '1 tablet', frequency: 'Once daily', duration: '1 month' }
];

const PrescriptionDetails = ({ 
  selectedMedicines, 
  onUpdateMedicine,
  prescriptionDetails,
  setPrescriptionDetails
}) => {
  const [dropdowns, setDropdowns] = useState({
    dosage: {},
    frequency: {},
    duration: {}
  });

  const [pdData, setPdData] = useState({
    system: 'Baxter',
    totalExchanges: '',
    dwellTime: '',
    first: '',
    second: '',
    third: '',
    fourth: '',
    fifth: '',
    sixth: '',
    bags: []
  });

  const [newBag, setNewBag] = useState({
    percentage: '',
    count: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const toggleDropdown = (field, medicineId) => {
    setDropdowns(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [medicineId]: !prev[field][medicineId]
      }
    }));
  };

  const handleOptionSelect = (medicineId, field, value) => {
    onUpdateMedicine(medicineId, field, value);
    setDropdowns(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [medicineId]: false
      }
    }));
  };

  const applyPreset = (medicineId, preset) => {
    onUpdateMedicine(medicineId, 'dosage', preset.dosage);
    onUpdateMedicine(medicineId, 'frequency', preset.frequency);
    onUpdateMedicine(medicineId, 'duration', preset.duration);
  };

  const getFilteredOptions = (options, inputValue) => {
    return options.filter(option =>
      option.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const handlePdDataChange = (field, value) => {
    setPdData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddBag = () => {
    if (!newBag.count) {
      toast.error('Please enter at least the bag count');
      return;
    }

    setPdData(prev => ({
      ...prev,
      bags: [...prev.bags, {
        percentage: newBag.percentage || '',
        count: newBag.count
      }]
    }));
    setNewBag({ percentage: '', count: '' });
  };

  const handleRemoveBag = (index) => {
    setPdData(prev => ({
      ...prev,
      bags: prev.bags.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate medicines - all fields required
    selectedMedicines.forEach((med, index) => {
      if (!med.dosage) {
        newErrors[`medicine-${index}-dosage`] = 'Dosage is required';
      }
      if (!med.frequency) {
        newErrors[`medicine-${index}-frequency`] = 'Frequency is required';
      }
      if (!med.duration) {
        newErrors[`medicine-${index}-duration`] = 'Duration is required';
      }
    });

    // Validate additional instructions
    if (!prescriptionDetails.additionalInstructions) {
      newErrors['additionalInstructions'] = 'Additional instructions are required';
    }

    // Validate PD data - all fields required except 4th, 5th, 6th exchanges
    const hasPdData = pdData.first || pdData.second || pdData.third || 
                     pdData.fourth || pdData.fifth || pdData.sixth || 
                     pdData.bags.length > 0;
    
    if (hasPdData) {
      if (!pdData.system) {
        newErrors['system'] = 'PD System is required';
      }
      if (!pdData.totalExchanges) {
        newErrors['totalExchanges'] = 'Total exchanges is required';
      }
      if (!pdData.dwellTime) {
        newErrors['dwellTime'] = 'Dwell time is required';
      }
      if (!pdData.first) {
        newErrors['first'] = '1st exchange is required';
      }
      if (!pdData.second) {
        newErrors['second'] = '2nd exchange is required';
      }
      if (!pdData.third) {
        newErrors['third'] = '3rd exchange is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreviewPrescription = () => {
    if (selectedMedicines.length === 0) {
      toast.error('Please add at least one medicine');
      return;
    }
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields before submitting');
      return;
    }
    
    setShowPreviewModal(true);
  };

  return (
    <DetailsContainer>
      <Section>
        <SectionHeader>
          <FaUserInjured color="var(--color-primary)" size={18} />
          <div>
            <SectionTitle>Patient Information</SectionTitle>
            <SectionSubtitle>Review patient details before prescribing</SectionSubtitle>
          </div>
        </SectionHeader>
        
        <PatientInfoCard>
          <InfoItem>
            <InfoLabel>
              <FaUserInjured color="var(--color-primary)" size={12} />
              Patient Name
            </InfoLabel>
            <InfoValue>
              {prescriptionDetails.patientName || 'Not available'}
            </InfoValue>
          </InfoItem>
          
          <InfoItem>
            <InfoLabel>
              <FaHospital color="var(--color-primary)" size={12} />
              Hospital Number
            </InfoLabel>
            <InfoValue>
              {prescriptionDetails.hospitalNumber || 'Not available'}
            </InfoValue>
          </InfoItem>
        </PatientInfoCard>
      </Section>

      <Section>
        <SectionHeader>
          <FaPills color="var(--color-primary)" size={18} />
          <div>
            <SectionTitle>Prescribed Medications</SectionTitle>
            <SectionSubtitle>{selectedMedicines.length} medication(s) selected</SectionSubtitle>
          </div>
        </SectionHeader>
        
        {selectedMedicines.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <FaInfoCircle />
            </EmptyIcon>
            <EmptyText>Select medicines from the list to add to prescription</EmptyText>
          </EmptyState>
        ) : (
          <MedicinesList>
            {selectedMedicines.map((medicine, index) => (
              <MedicineCard key={`${medicine.id}-${index}`}>
                <MedicineHeader>
                  <MedicineTitle>
                    <MedicineNumber>{index + 1}.</MedicineNumber>
                    <MedicineName>{medicine.name}</MedicineName>
                  </MedicineTitle>
                  <RemoveButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateMedicine(medicine.id, 'remove');
                    }}
                    aria-label={`Remove ${medicine.name}`}
                  >
                    <FaTimes size={12} />
                  </RemoveButton>
                </MedicineHeader>
                
                <MedicineGeneric>{medicine.generic_name}</MedicineGeneric>
                
                <InputGroup>
                  <InputLabel>
                    Dosage
                    <InfoTooltip>
                      <FaQuestionCircle size={12} color="var(--color-gray-400)" />
                      <TooltipContent>
                        Typical dosages: 1 tablet, 500mg, 5ml, etc.
                      </TooltipContent>
                    </InfoTooltip>
                  </InputLabel>
                  <InputHint>Enter the amount per dose (e.g., 500mg, 1 tablet)</InputHint>
                  <InputContainer>
                    <InputField
                      type="text"
                      value={medicine.dosage || ''}
                      onChange={(e) => onUpdateMedicine(medicine.id, 'dosage', e.target.value)}
                      onFocus={() => toggleDropdown('dosage', medicine.id)}
                      placeholder="Dosage amount"
                      className={errors[`medicine-${index}-dosage`] ? 'error' : ''}
                    />
                    {dropdowns.dosage[medicine.id] && (
                      <DropdownList>
                        {getFilteredOptions(dosageOptions, medicine.dosage || '').map((option, i) => (
                          <DropdownItem 
                            key={i}
                            onClick={() => handleOptionSelect(medicine.id, 'dosage', option)}
                          >
                            {option}
                          </DropdownItem>
                        ))}
                      </DropdownList>
                    )}
                  </InputContainer>
                  {errors[`medicine-${index}-dosage`] && (
                    <ErrorMessage>{errors[`medicine-${index}-dosage`]}</ErrorMessage>
                  )}
                </InputGroup>
                
                <InputGroup>
                  <InputLabel>
                    Frequency
                    <InfoTooltip>
                      <FaQuestionCircle size={12} color="var(--color-gray-400)" />
                      <TooltipContent>
                        How often the patient should take the medication
                      </TooltipContent>
                    </InfoTooltip>
                  </InputLabel>
                  <InputHint>How often should it be taken (e.g., Twice daily)</InputHint>
                  <InputContainer>
                    <InputField
                      type="text"
                      value={medicine.frequency || ''}
                      onChange={(e) => onUpdateMedicine(medicine.id, 'frequency', e.target.value)}
                      onFocus={() => toggleDropdown('frequency', medicine.id)}
                      placeholder="Frequency of use"
                      className={errors[`medicine-${index}-frequency`] ? 'error' : ''}
                    />
                    {dropdowns.frequency[medicine.id] && (
                      <DropdownList>
                        {getFilteredOptions(frequencyOptions, medicine.frequency || '').map((option, i) => (
                          <DropdownItem 
                            key={i}
                            onClick={() => handleOptionSelect(medicine.id, 'frequency', option)}
                          >
                            {option}
                          </DropdownItem>
                        ))}
                      </DropdownList>
                    )}
                  </InputContainer>
                  {errors[`medicine-${index}-frequency`] && (
                    <ErrorMessage>{errors[`medicine-${index}-frequency`]}</ErrorMessage>
                  )}
                </InputGroup>
                
                <InputGroup>
                  <InputLabel>
                    Duration
                    <InfoTooltip>
                      <FaQuestionCircle size={12} color="var(--color-gray-400)" />
                      <TooltipContent>
                        How long the treatment should last
                      </TooltipContent>
                    </InfoTooltip>
                  </InputLabel>
                  <InputHint>How long should it be taken (e.g., 7 days)</InputHint>
                  <InputContainer>
                    <InputField
                      type="text"
                      value={medicine.duration || ''}
                      onChange={(e) => onUpdateMedicine(medicine.id, 'duration', e.target.value)}
                      onFocus={() => toggleDropdown('duration', medicine.id)}
                      placeholder="Duration of treatment"
                      className={errors[`medicine-${index}-duration`] ? 'error' : ''}
                    />
                    {dropdowns.duration[medicine.id] && (
                      <DropdownList>
                        {getFilteredOptions(durationOptions, medicine.duration || '').map((option, i) => (
                          <DropdownItem 
                            key={i}
                            onClick={() => handleOptionSelect(medicine.id, 'duration', option)}
                          >
                            {option}
                          </DropdownItem>
                        ))}
                      </DropdownList>
                    )}
                  </InputContainer>
                  {errors[`medicine-${index}-duration`] && (
                    <ErrorMessage>{errors[`medicine-${index}-duration`]}</ErrorMessage>
                  )}
                </InputGroup>

                <QuickPresets>
                  {commonPresets.map((preset, i) => (
                    <PresetButton 
                      key={i}
                      onClick={() => applyPreset(medicine.id, preset)}
                    >
                      {preset.name}
                    </PresetButton>
                  ))}
                </QuickPresets>
              </MedicineCard>
            ))}
          </MedicinesList>
        )}
      </Section>

      <PdSection>
        <SectionHeader>
          <FaInfoCircle color="var(--color-primary)" size={18} />
          <div>
            <SectionTitle>PD Solution Information</SectionTitle>
            <SectionSubtitle>Enter peritoneal dialysis details</SectionSubtitle>
          </div>
        </SectionHeader>
        
        <PdInputGroup>
          <div>
            <InputLabel>PD System</InputLabel>
            <PdInputField
              type="text"
              value={pdData.system}
              onChange={(e) => handlePdDataChange('system', e.target.value)}
              placeholder="e.g., Baxter"
            />
          </div>
          <div>
            <InputLabel>Total exchanges per day</InputLabel>
            <PdInputField
              type="number"
              value={pdData.totalExchanges}
              onChange={(e) => handlePdDataChange('totalExchanges', e.target.value)}
              placeholder="e.g., 3"
              min="0"
              className={errors['totalExchanges'] ? 'error' : ''}
            />
            {errors['totalExchanges'] && (
              <ErrorMessage>{errors['totalExchanges']}</ErrorMessage>
            )}
          </div>
        </PdInputGroup>
        
        <InputGroup>
          <InputLabel>Dwell Time (hours)</InputLabel>
          <PdInputField
            type="number"
            value={pdData.dwellTime}
            onChange={(e) => handlePdDataChange('dwellTime', e.target.value)}
            placeholder="e.g., 6"
            min="0"
            step="0.5"
            style={{ marginBottom: '0.5rem' }}
            className={errors['dwellTime'] ? 'error' : ''}
          />
          {errors['dwellTime'] && (
            <ErrorMessage>{errors['dwellTime']}</ErrorMessage>
          )}
        </InputGroup>
        
        <PdTable>
          <thead>
            <tr>
              <PdTh>Dwell Time</PdTh>
              <PdTh>1st</PdTh>
              <PdTh>2nd</PdTh>
              <PdTh>3rd</PdTh>
              <PdTh>4th</PdTh>
              <PdTh>5th</PdTh>
              <PdTh>6th</PdTh>
            </tr>
          </thead>
          <tbody>
            <tr>
              <PdTd>{pdData.dwellTime || '___'} hours</PdTd>
              <PdTd>
                <PdInputField
                  type="number"
                  value={pdData.first}
                  onChange={(e) => handlePdDataChange('first', e.target.value)}
                  placeholder="1.5"
                  min="0"
                  step="0.5"
                  style={{ width: '100%', textAlign: 'center' }}
                  className={errors['first'] ? 'error' : ''}
                />
                {errors['first'] && <PdError>{errors['first']}</PdError>}
              </PdTd>
              <PdTd>
                <PdInputField
                  type="number"
                  value={pdData.second}
                  onChange={(e) => handlePdDataChange('second', e.target.value)}
                  placeholder="1.5"
                  min="0"
                  step="0.5"
                  style={{ width: '100%', textAlign: 'center' }}
                  className={errors['second'] ? 'error' : ''}
                />
                {errors['second'] && <PdError>{errors['second']}</PdError>}
              </PdTd>
              <PdTd>
                <PdInputField
                  type="number"
                  value={pdData.third}
                  onChange={(e) => handlePdDataChange('third', e.target.value)}
                  placeholder="2.5"
                  min="0"
                  step="0.5"
                  style={{ width: '100%', textAlign: 'center' }}
                  className={errors['third'] ? 'error' : ''}
                />
                {errors['third'] && <PdError>{errors['third']}</PdError>}
              </PdTd>
              <PdTd>
                <PdInputField
                  type="number"
                  value={pdData.fourth}
                  onChange={(e) => handlePdDataChange('fourth', e.target.value)}
                  placeholder="Optional"
                  min="0"
                  step="0.5"
                  style={{ width: '100%', textAlign: 'center' }}
                />
              </PdTd>
              <PdTd>
                <PdInputField
                  type="number"
                  value={pdData.fifth}
                  onChange={(e) => handlePdDataChange('fifth', e.target.value)}
                  placeholder="Optional"
                  min="0"
                  step="0.5"
                  style={{ width: '100%', textAlign: 'center' }}
                />
              </PdTd>
              <PdTd>
                <PdInputField
                  type="number"
                  value={pdData.sixth}
                  onChange={(e) => handlePdDataChange('sixth', e.target.value)}
                  placeholder="Optional"
                  min="0"
                  step="0.5"
                  style={{ width: '100%', textAlign: 'center' }}
                />
              </PdTd>
            </tr>
          </tbody>
        </PdTable>
        
        <InputLabel>PD Solution</InputLabel>
        <BagInputContainer>
          <BagInput
            type="number"
            value={newBag.percentage}
            onChange={(e) => setNewBag({ ...newBag, percentage: e.target.value })}
            placeholder="Bag Percentage"
            min="0"
            step="0.1"
          />
          <BagInput
            type="number"
            value={newBag.count}
            onChange={(e) => setNewBag({ ...newBag, count: e.target.value })}
            placeholder="Number of Bags"
            min="1"
            required
          />
          <AddBagButton onClick={handleAddBag}>
            <FaPlus size={12} />
          </AddBagButton>
        </BagInputContainer>
        
        {pdData.bags.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            {pdData.bags.map((bag, index) => (
              <BagItem key={index}>
                <span>{bag.percentage ? `${bag.percentage}% - ` : ''}{bag.count}</span>
                <RemoveBagButton onClick={() => handleRemoveBag(index)}>
                  <FaTimes size={10} />
                </RemoveBagButton>
              </BagItem>
            ))}
          </div>
        )}
      </PdSection>

      <Section>
        <SectionHeader>
          <FaInfoCircle color="var(--color-primary)" size={18} />
          <div>
            <SectionTitle>Additional Instructions</SectionTitle>
            <SectionSubtitle>Provide any special instructions for the patient</SectionSubtitle>
          </div>
        </SectionHeader>
        
        <InstructionsContainer>
          <InstructionsTextarea
            value={prescriptionDetails.additionalInstructions || ''}
            onChange={(e) => setPrescriptionDetails({
              ...prescriptionDetails,
              additionalInstructions: e.target.value
            })}
            placeholder="Enter any additional instructions for the patient..."
          />
        </InstructionsContainer>
      </Section>

      <Section>
        <SaveButton 
          onClick={handlePreviewPrescription}
          disabled={selectedMedicines.length === 0 || isSaving}
        >
          {isSaving ? (
            'Saving...'
          ) : (
            <>
              <FaFilePdf />
              Preview & Send Prescription
            </>
          )}
        </SaveButton>
        
        {success && (
          <SuccessMessage>
            <FaCheckCircle />
            Prescription generated successfully!
          </SuccessMessage>
        )}
      </Section>

      <ShowPrescribeModal
        isOpen={showPreviewModal}
        onClose={(shouldSave) => {
          setShowPreviewModal(false);
          if (shouldSave) {
            setSuccess(true);
          }
        }}
        patientName={prescriptionDetails.patientName}
        patientHospitalNumber={prescriptionDetails.hospitalNumber}
        medicines={selectedMedicines}
        pdData={pdData}
        additionalInstructions={prescriptionDetails.additionalInstructions}
      />
    </DetailsContainer>
  );
};

export default PrescriptionDetails;