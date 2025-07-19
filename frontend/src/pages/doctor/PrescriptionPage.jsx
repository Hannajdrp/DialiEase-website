import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaSearch, FaPlus, FaFileAlt, FaArrowLeft, FaPills, 
  FaChevronRight, FaRegCheckCircle, FaRegTimesCircle, FaInfoCircle,
  FaTimes, FaFilter, FaChevronDown, FaInfo
} from 'react-icons/fa';
import { BsPrescription2 } from 'react-icons/bs';
import styled from 'styled-components';
import PrescriptionDetails from './PrescriptionDetails';
import AddNewMedsModal from './AddNewMedsModal';
import MedicineInfoModal from './MedicineInfoModal';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import Spinner from '../../components/Spinner';

const Container = styled.div`
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
  
  background-color: var(--color-gray-50);
  min-height: 100vh;
  padding: 2rem;
  width: 102%;
  margin-left: -1%;
  max-width: none;

  @media (max-width: 768px) {
    width: 100%;
    margin-left: 0;
    padding: 1rem;
  }
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
  margin-top: -530px;

  @media (min-width: 1024px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: var(--color-gray-800);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.9rem;
  color: var(--color-gray-600);
  flex-wrap: wrap;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: ${({ $active }) => $active ? 'var(--color-primary)' : 'var(--color-gray-400)'};
  font-weight: ${({ $active }) => $active ? '600' : '500'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const Button = styled.button`
  background-color: ${({ $primary }) => $primary ? 'var(--color-primary)' : 'var(--color-gray-100)'};
  color: ${({ $primary }) => $primary ? 'var(--color-white)' : 'var(--color-gray-800)'};
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  transition: all 0.2s ease;
  box-shadow: ${({ $primary }) => $primary ? '0 1px 3px rgba(79, 70, 229, 0.3)' : 'none'};
  white-space: nowrap;

  &:hover {
    background-color: ${({ $primary }) => $primary ? 'var(--color-primary-light)' : 'var(--color-gray-200)'};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 1.5rem;
  height: calc(100vh - 180px);

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`;

const Panel = styled.section`
  background-color: var(--color-white);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-gray-200);
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border: 1px solid var(--color-gray-200);
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background-color: var(--color-gray-50);

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    background-color: var(--color-white);
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-gray-400);
`;

const FilterBar = styled.div`
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterTag = styled.button`
  background-color: ${({ $active }) => $active ? 'var(--color-primary)' : 'var(--color-gray-50)'};
  color: ${({ $active }) => $active ? 'var(--color-white)' : 'var(--color-gray-600)'};
  border: 1px solid ${({ $active }) => $active ? 'var(--color-primary)' : 'var(--color-gray-200)'};
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
  font-weight: 500;

  &:hover {
    border-color: var(--color-primary);
    color: ${({ $active }) => $active ? 'var(--color-white)' : 'var(--color-primary)'};
  }
`;

const CategoryDropdown = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button`
  background-color: var(--color-gray-50);
  color: var(--color-gray-600);
  border: 1px solid var(--color-gray-200);
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-weight: 500;

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
`;

const DropdownContent = styled.div`
  position: absolute;
  background-color: var(--color-white);
  min-width: 200px;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  z-index: 10;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  border: 1px solid var(--color-gray-200);
`;

const DropdownItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 0.6rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--color-gray-800);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.1s ease;

  &:hover {
    background-color: var(--color-gray-50);
    color: var(--color-primary);
  }
`;

const MedicineGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.2rem;
  margin-top: 0.5rem;
`;

const MedicineCard = styled.div`
  background-color: var(--color-white);
  border-radius: 10px;
  padding: 1.2rem;
  border: 1px solid ${({ $selected }) => $selected ? 'var(--color-primary)' : 'var(--color-gray-200)'};
  box-shadow: ${({ $selected }) => $selected ? '0 2px 6px rgba(79, 70, 229, 0.15)' : '0 1px 2px rgba(0, 0, 0, 0.05)'};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-color: var(--color-primary);
  }
`;

const MedicineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const MedicineName = styled.h3`
  font-size: 1.05rem;
  color: var(--color-gray-800);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 600;
`;

const MedicineGeneric = styled.p`
  font-size: 0.85rem;
  color: var(--color-gray-600);
  margin: 0.2rem 0 0.8rem 0;
  line-height: 1.4;
`;

const MedicineDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.8rem;
`;

const MedicineDetail = styled.div`
  background-color: var(--color-gray-50);
  border-radius: 8px;
  padding: 0.6rem;
  font-size: 0.85rem;
  color: var(--color-gray-800);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  border: 1px solid var(--color-gray-200);
`;

const DetailLabel = styled.span`
  font-weight: 500;
  color: var(--color-gray-600);
  font-size: 0.75rem;
`;

const DetailValue = styled.span`
  font-weight: 600;
  color: var(--color-gray-800);
  font-size: 0.85rem;
`;

const SelectionIndicator = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid ${({ $selected }) => $selected ? 'var(--color-primary)' : 'var(--color-gray-400)'};
  background-color: ${({ $selected }) => $selected ? 'var(--color-primary)' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.7rem;
  flex-shrink: 0;
  transition: all 0.2s ease;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: var(--color-gray-600);
  background-color: var(--color-gray-50);
  border-radius: 10px;
  border: 1px dashed var(--color-gray-200);
  margin-top: 1rem;
`;

const InfoIcon = styled(FaInfo)`
  color: var(--color-gray-400);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 0.3rem;

  &:hover {
    color: var(--color-primary);
    transform: scale(1.1);
  }
`;

const PrescriptionPage = () => {
  const { patientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedMedicineInfo, setSelectedMedicineInfo] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  const [prescriptionDetails, setPrescriptionDetails] = useState({
    patientId: patientId,
    additionalInstructions: '',
    patientName: location.state?.patientName || '',
    hospitalNumber: location.state?.hospitalNumber || '',
    legalRepresentative: location.state?.legalRepresentative || ''
  });

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        const response = await api.get('/prescriptions');
        setMedicines(response.data.medicines);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  const toggleMedicineSelection = (medicine) => {
    setSelectedMedicines(prev => {
      const isSelected = prev.some(m => m.id === medicine.id);
      if (isSelected) {
        return prev.filter(m => m.id !== medicine.id);
      } else {
        return [...prev, {
          id: medicine.id,
          name: medicine.name,
          generic_name: medicine.generic_name,
          dosage: '',
          frequency: '',
          duration: '',
          notes: ''
        }];
      }
    });
  };

  const updateMedicineDetails = (id, field, value) => {
    if (field === 'remove') {
      setSelectedMedicines(prev => prev.filter(medicine => medicine.id !== id));
    } else {
      setSelectedMedicines(prev => 
        prev.map(medicine => 
          medicine.id === id ? { ...medicine, [field]: value } : medicine
        )
      );
    }
  };

  const handleGeneratePrescription = async () => {
    const incompleteMedicines = selectedMedicines.some(med => 
      !med.dosage || !med.frequency || !med.duration
    );

    if (incompleteMedicines) {
      toast.error('Please complete dosage, frequency, and duration for all selected medicines');
      return;
    }

    try {
      setGenerating(true);
      await api.post('/prescriptions/generate', {
        patient_id: patientId,
        medicines: selectedMedicines,
        additional_instructions: prescriptionDetails.additionalInstructions
      });
      
      toast.success('Prescription generated successfully!');
      navigate(`/patient/${patientId}/prescriptions`);
    } catch (err) {
      toast.error(`Failed to generate prescription: ${err.response?.data?.message || err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleAddNewMedicine = async (newMedicine) => {
    try {
      const response = await api.post('/prescriptions/medicines', newMedicine);
      setMedicines(prev => [...prev, response.data.medicine]);
      setShowAddModal(false);
      toast.success('Medicine added successfully!');
    } catch (err) {
      toast.error(`Failed to add new medicine: ${err.response?.data?.message || err.message}`);
    }
  };

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         medicine.generic_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'selected') return selectedMedicines.some(m => m.id === medicine.id) && matchesSearch;
    return medicine.category.toLowerCase() === activeFilter.toLowerCase() && matchesSearch;
  });

  const categories = [...new Set(medicines.map(m => m.category))];

  if (loading) return <Container><Spinner /></Container>;
  if (error) return <Container><p style={{ color: 'red' }}>Error: {error}</p></Container>;

  return (
    <Container>
      <Header>
        <TitleContainer>
          <TitleWrapper>
            <Button onClick={() => navigate(-1)} style={{ padding: '0.7rem', borderRadius: '50%' }}>
              <FaArrowLeft />
            </Button>
            <Title>
              <BsPrescription2 color="var(--color-primary)" />
              Prescription for {prescriptionDetails.patientName || 'Patient'}
            </Title>
          </TitleWrapper>
          <StepIndicator>
            <Step $active={true}>
              <FaRegCheckCircle />
              <span>Select Medicines</span>
            </Step>
            <FaChevronRight size={12} />
            <Step $active={selectedMedicines.length > 0}>
              {selectedMedicines.length > 0 ? <FaRegCheckCircle /> : <FaRegTimesCircle />}
              <span>Configure Prescription</span>
            </Step>
            <FaChevronRight size={12} />
            <Step $active={false}>
              <FaRegTimesCircle />
              <span>Review & Generate</span>
            </Step>
          </StepIndicator>
        </TitleContainer>
        
        <ActionButtons>
          <Button onClick={() => setShowAddModal(true)}>
            <FaPlus />
            Add Medicine
          </Button>
          <Button 
            $primary 
            onClick={handleGeneratePrescription}
            disabled={selectedMedicines.length === 0 || generating}
          >
            {generating ? (
              <Spinner size="sm" />
            ) : (
              <>
                <FaFileAlt />
                Generate Prescription
              </>
            )}
          </Button>
        </ActionButtons>
      </Header>

      <MainLayout>
        <Panel>
          <SearchContainer>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search medicines by name or generic name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
          
          <FilterBar>
            <FilterTag 
              $active={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
            >
              <FaFilter size={12} />
              All Medicines
            </FilterTag>
            <FilterTag 
              $active={activeFilter === 'selected'}
              onClick={() => setActiveFilter('selected')}
            >
              Selected Only
            </FilterTag>
            
            <CategoryDropdown>
              <DropdownButton onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}>
                Categories
                <FaChevronDown size={12} />
              </DropdownButton>
              {showCategoryDropdown && (
                <DropdownContent>
                  {categories.map(category => (
                    <DropdownItem 
                      key={category}
                      onClick={() => {
                        setActiveFilter(category.toLowerCase());
                        setShowCategoryDropdown(false);
                      }}
                    >
                      {category}
                    </DropdownItem>
                  ))}
                </DropdownContent>
              )}
            </CategoryDropdown>
          </FilterBar>

          {filteredMedicines.length === 0 ? (
            <EmptyState>
              <FaInfoCircle size={36} color="var(--color-gray-400)" style={{ marginBottom: '1rem' }} />
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-gray-800)' }}>No medicines found</h4>
              <p style={{ margin: '0', color: 'var(--color-gray-600)' }}>Try adjusting your search or filters</p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setActiveFilter('all');
                }}
                style={{ marginTop: '1rem' }}
              >
                Reset Filters
              </Button>
            </EmptyState>
          ) : (
            <MedicineGrid>
              {filteredMedicines.map(medicine => {
                const isSelected = selectedMedicines.some(m => m.id === medicine.id);
                return (
                  <MedicineCard 
                    key={medicine.id} 
                    onClick={() => toggleMedicineSelection(medicine)}
                    $selected={isSelected}
                  >
                    <MedicineHeader>
                      <div>
                        <MedicineName>
                          <FaPills color={isSelected ? 'var(--color-primary)' : 'var(--color-gray-600)'} />
                          {medicine.name}
                          <InfoIcon 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMedicineInfo(medicine);
                            }}
                          />
                        </MedicineName>
                        <MedicineGeneric>{medicine.generic_name}</MedicineGeneric>
                      </div>
                      <SelectionIndicator $selected={isSelected}>
                        {isSelected && <FaTimes size={10} />}
                      </SelectionIndicator>
                    </MedicineHeader>
                    
                    <MedicineDetails>
                      <MedicineDetail>
                        <DetailLabel>Category</DetailLabel>
                        <DetailValue>{medicine.category || 'General'}</DetailValue>
                      </MedicineDetail>
                      <MedicineDetail>
                        <DetailLabel>Form</DetailLabel>
                        <DetailValue>{medicine.form || 'Tablet'}</DetailValue>
                      </MedicineDetail>
                    </MedicineDetails>
                  </MedicineCard>
                );
              })}
            </MedicineGrid>
          )}
        </Panel>

        <Panel>
          <PrescriptionDetails 
            selectedMedicines={selectedMedicines}
            onUpdateMedicine={updateMedicineDetails}
            prescriptionDetails={prescriptionDetails}
            setPrescriptionDetails={setPrescriptionDetails}
          />
        </Panel>
      </MainLayout>

      <AddNewMedsModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddNewMedicine}
      />

      {selectedMedicineInfo && (
        <MedicineInfoModal 
          medicine={selectedMedicineInfo}
          onClose={() => setSelectedMedicineInfo(null)}
        />
      )}
    </Container>
  );
};

export default PrescriptionPage;