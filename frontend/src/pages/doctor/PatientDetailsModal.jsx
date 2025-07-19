import React, { useState, useEffect } from 'react';
import { 
  FiActivity, 
  FiThermometer, 
  FiDroplet, 
  FiPrinter, 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiX,
  FiPlus,
  FiMinus,
  FiUser,
  FiAlertTriangle,
  FiInfo,
  FiSearch,
  FiExternalLink,
  FiFileText
} from 'react-icons/fi';
import { FaRegChartBar, FaNotesMedical } from 'react-icons/fa';
import { BsClipboard2Pulse, BsDropletHalf } from 'react-icons/bs';
import { GiKidneys } from 'react-icons/gi';
import { MdBloodtype } from 'react-icons/md';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { generatePatientPDF } from '../../services/PDFService';

const PatientDetailModal = ({ patient, onClose }) => {
    const [fontSize, setFontSize] = useState(16);
    const [showFluidGuide, setShowFluidGuide] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [medicalResults, setMedicalResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const searchMedicalTerm = async () => {
        if (!searchTerm.trim()) return;
        
        setIsSearching(true);
        setSearchError(null);
        setMedicalResults(null);
        
        try {
            // Clean and prepare the search term (preserve phrases in quotes)
            const cleanedTerm = searchTerm.trim();
            const isPhraseSearch = cleanedTerm.includes('"') || cleanedTerm.split(/\s+/).length > 1;
            
            // First try Wikipedia with the exact phrase
            const wikiResponse = await axios.get(
                `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&exintro=true&explaintext=true&pithumbsize=300&titles=${encodeURIComponent(cleanedTerm)}&origin=*`
            );
            
            const pages = wikiResponse.data.query.pages;
            const pageId = Object.keys(pages)[0];
            
            if (pageId !== '-1') {
                const page = pages[pageId];
                setMedicalResults({
                    term: page.title,
                    description: page.extract ? page.extract.substring(0, 400) + '...' : 'No description available.',
                    image: page.thumbnail ? page.thumbnail.source : null,
                    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
                    source: 'Wikipedia',
                    isExactMatch: true
                });
            } else {
                // If no exact match, try medical APIs with different approaches
                let foundResult = false;
                
                // Strategy 1: Try exact phrase in medical API
                const medResponseExact = await axios.get(
                    `https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?terms=${encodeURIComponent(cleanedTerm)}&maxList=1`
                );
                
                if (medResponseExact.data && medResponseExact.data[1] && medResponseExact.data[1].length > 0) {
                    const result = medResponseExact.data[1][0];
                    setMedicalResults({
                        term: result[0],
                        rxNormId: result[1],
                        strength: result[2],
                        doseForm: result[3],
                        url: `https://www.ncbi.nlm.nih.gov/mesh/?term=${encodeURIComponent(result[0])}`,
                        source: 'NLM Medical API',
                        isExactMatch: true
                    });
                    foundResult = true;
                }
                
                // Strategy 2: If no exact match, try individual words in different combinations
                if (!foundResult && isPhraseSearch) {
                    const terms = cleanedTerm.split(/\s+/).filter(t => t.length > 0);
                    
                    // Try all possible 2-word combinations for phrases
                    for (let i = 0; i < terms.length - 1 && !foundResult; i++) {
                        const phrase = `${terms[i]} ${terms[i+1]}`;
                        const medResponsePhrase = await axios.get(
                            `https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?terms=${encodeURIComponent(phrase)}&maxList=1`
                        );
                        
                        if (medResponsePhrase.data && medResponsePhrase.data[1] && medResponsePhrase.data[1].length > 0) {
                            const result = medResponsePhrase.data[1][0];
                            setMedicalResults({
                                term: result[0],
                                rxNormId: result[1],
                                strength: result[2],
                                doseForm: result[3],
                                url: `https://www.ncbi.nlm.nih.gov/mesh/?term=${encodeURIComponent(result[0])}`,
                                source: 'NLM Medical API',
                                note: `Showing results for "${phrase}" as exact phrase not found`
                            });
                            foundResult = true;
                        }
                    }
                    
                    // Strategy 3: Try individual significant words
                    if (!foundResult) {
                        for (let i = 0; i < terms.length && !foundResult; i++) {
                            // Skip small words unless they're medically relevant
                            if (terms[i].length > 3 || ['iv', 'po', 'qd', 'bid', 'tid', 'qid'].includes(terms[i].toLowerCase())) {
                                const medResponseSingle = await axios.get(
                                    `https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?terms=${encodeURIComponent(terms[i])}&maxList=1`
                                );
                                
                                if (medResponseSingle.data && medResponseSingle.data[1] && medResponseSingle.data[1].length > 0) {
                                    const result = medResponseSingle.data[1][0];
                                    setMedicalResults({
                                        term: result[0],
                                        rxNormId: result[1],
                                        strength: result[2],
                                        doseForm: result[3],
                                        url: `https://www.ncbi.nlm.nih.gov/mesh/?term=${encodeURIComponent(result[0])}`,
                                        source: 'NLM Medical API',
                                        note: `Showing results for "${terms[i]}" as full phrase not found`
                                    });
                                    foundResult = true;
                                }
                            }
                        }
                    }
                }
                
                if (!foundResult) {
                    setSearchError(`No results found for "${cleanedTerm}" in Wikipedia or medical databases. Try a different term or more specific phrase.`);
                }
            }
        } catch (error) {
            console.error('Error searching term:', error);
            setSearchError('Failed to search term. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return { years: 'N/A', isAdult: null };
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let years = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            years--;
        }
        
        return {
            years,
            isAdult: years >= 18,
            classification: years >= 18 ? 'Adult' : 'Pediatric'
        };
    };

    const ageData = calculateAge(patient.date_of_birth);

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const calculateBalance = (volumeIn, volumeOut) => {
        const balance = volumeIn - volumeOut;
        return {
            value: balance,
            formatted: balance > 0 ? `+${balance}mL` : `${balance}mL`,
            isPositive: balance > 0,
            interpretation: balance <= 0 
                ? 'Good: Excess fluid removed' 
                : 'Warning: Fluid retention detected'
        };
    };

    const calculateDailyBalances = () => {
        const dailyData = {};
        
        patient.treatments.forEach(treatment => {
            const date = new Date(treatment.treatmentDate).toISOString().split('T')[0];
            
            if (!dailyData[date]) {
                dailyData[date] = {
                    date: date,
                    formattedDate: formatDate(date),
                    treatments: [],
                    volumeIn: 0,
                    volumeOut: 0,
                    netBalance: 0,
                    bloodPressure: treatment.BloodPressure || null
                };
            }
            
            const balance = (treatment.VolumeIn || 0) - (treatment.VolumeOut || 0);
            
            dailyData[date].treatments.push({
                ...treatment,
                balance: balance,
                formattedBalance: balance > 0 ? `+${balance}mL` : `${balance}mL`,
                interpretation: balance <= 0 
                    ? 'Good: Excess fluid removed' 
                    : 'Warning: Fluid retention detected'
            });
            
            dailyData[date].volumeIn += treatment.VolumeIn || 0;
            dailyData[date].volumeOut += treatment.VolumeOut || 0;
            dailyData[date].netBalance += balance;
            
            if (!dailyData[date].bloodPressure && treatment.BloodPressure) {
                dailyData[date].bloodPressure = treatment.BloodPressure;
            }
        });
        
        let totalBalance = 0;
        Object.values(dailyData).forEach(day => {
            totalBalance += day.netBalance;
        });
        
        return {
            dailyData: Object.values(dailyData).sort((a, b) => new Date(b.date) - new Date(a.date)),
            totalBalance: {
                value: totalBalance,
                formatted: totalBalance > 0 ? `+${totalBalance}mL` : `${totalBalance}mL`,
                isPositive: totalBalance > 0,
                interpretation: totalBalance <= 0 
                    ? 'Good: Overall fluid removal' 
                    : 'Warning: Overall fluid retention'
            }
        };
    };

    const { dailyData, totalBalance } = calculateDailyBalances();

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'finished': return '#28a745';
            case 'ongoing': return '#ffc107';
            case 'scheduled': return '#17a2b8';
            case 'cancelled': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const getColorClass = (color) => {
        if (!color) return '';
        color = color.toLowerCase();
        
        if (color === 'clear') return 'color-clear';
        if (color === 'yellow' || color === 'amber') return 'color-normal';
        return 'color-abnormal';
    };

    const prepareChartData = () => {
        return dailyData
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-14)
            .map(day => ({
                date: day.formattedDate,
                volumeIn: day.volumeIn,
                volumeOut: day.volumeOut,
                netUF: day.netBalance,
                treatmentCount: day.treatments.length
            }));
    };

    const chartData = prepareChartData();

    const generatePDF = async () => {
        setIsGeneratingPDF(true);
        try {
            const pdfBlob = await generatePatientPDF(patient);
            const pdfUrl = URL.createObjectURL(pdfBlob);
            
            const downloadLink = document.createElement('a');
            downloadLink.href = pdfUrl;
            downloadLink.download = `Patient_Report_${patient.name.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const treatmentFrequency = () => {
        if (dailyData.length < 2) return 'Insufficient data';
        
        const firstDate = new Date(dailyData[dailyData.length - 1].date);
        const lastDate = new Date(dailyData[0].date);
        const daysBetween = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
        const treatmentsPerWeek = (dailyData.length / daysBetween) * 7;
        
        if (treatmentsPerWeek > 5) return 'Intensive (6-7 times/week)';
        if (treatmentsPerWeek > 3) return 'Standard (4-5 times/week)';
        return 'Minimal (1-3 times/week)';
    };

    const averageFluidRemoval = () => {
        if (dailyData.length === 0) return 'N/A';
        
        const totalRemoval = dailyData.reduce((sum, day) => sum + day.volumeOut, 0);
        const avgRemoval = totalRemoval / dailyData.length;
        
        return `${Math.round(avgRemoval)}mL per session`;
    };

    const getAgeClassificationNote = () => {
        if (ageData.isAdult === null) return '';
        return ageData.isAdult 
            ? 'Adult patient (18 years or older)' 
            : 'Pediatric patient (less than 18 years) - Consider pediatric-specific parameters';
    };

    const getFluidGuideText = () => {
        return {
            negative: 'Good, excess fluid removed (Volume Out greater than Volume In)',
            positive: 'Warning, fluid retention detected (Volume In greater than Volume Out)'
        };
    };

    const fluidGuide = getFluidGuideText();

    return (
        <div 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div 
                style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    width: '95%',
                    maxWidth: '1400px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                    position: 'relative',
                    fontSize: `${fontSize}px`
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: '#6c757d',
                        zIndex: 10
                    }}
                >
                    <FiX />
                </button>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.5rem',
                    borderBottom: '1px solid #eee',
                    position: 'sticky',
                    top: 0,
                    backgroundColor: '#fff',
                    zIndex: 5
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            backgroundColor: '#3498db',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '1.5rem',
                            fontSize: '1.5rem',
                            fontWeight: 'bold'
                        }}>
                            {patient.name.charAt(0)}
                        </div>
                        <div>
                            <h2 style={{ 
                                margin: 0,
                                color: '#2c3e50',
                                fontSize: '1.5rem'
                            }}>{patient.name}</h2>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                marginTop: '0.5rem'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '0.8rem',
                                    marginTop: '0.5rem'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        backgroundColor: '#f0f4f8',
                                        padding: '0.3rem 0.8rem',
                                        borderRadius: '20px'
                                    }}>
                                        <span style={{ 
                                            color: '#4a5568',
                                            fontWeight: '500',
                                            fontSize: '0.8rem'
                                        }}>HN:</span>
                                        <span style={{ 
                                            color: '#2c3e50',
                                            fontWeight: '600',
                                            fontSize: '0.9rem'
                                        }}>{patient.hospitalNumber}</span>
                                    </div>

                                    {patient.email && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.3rem',
                                            backgroundColor: '#f0f4f8',
                                            padding: '0.3rem 0.8rem',
                                            borderRadius: '20px'
                                        }}>
                                            <span style={{ 
                                                color: '#4a5568',
                                                fontWeight: '500',
                                                fontSize: '0.8rem'
                                            }}>Email:</span>
                                            <a 
                                                href={`mailto:${patient.email}`}
                                                style={{
                                                    color: '#3182ce',
                                                    textDecoration: 'none',
                                                    fontWeight: '600',
                                                    fontSize: '0.9rem',
                                                    ':hover': {
                                                        textDecoration: 'underline'
                                                    }
                                                }}
                                            >
                                                {patient.email}
                                            </a>
                                        </div>
                                    )}

                                    {patient.phone && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.3rem',
                                            backgroundColor: '#f0f4f8',
                                            padding: '0.3rem 0.8rem',
                                            borderRadius: '20px'
                                        }}>
                                            <span style={{ 
                                                color: '#4a5568',
                                                fontWeight: '500',
                                                fontSize: '0.8rem'
                                            }}>Phone:</span>
                                            <a 
                                                href={`tel:${patient.phone}`}
                                                style={{
                                                    color: '#3182ce',
                                                    textDecoration: 'none',
                                                    fontWeight: '600',
                                                    fontSize: '0.9rem',
                                                    ':hover': {
                                                        textDecoration: 'underline'
                                                    }
                                                }}
                                            >
                                                {patient.phone}
                                            </a>
                                        </div>
                                    )}

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        backgroundColor: '#f0f4f8',
                                        padding: '0.3rem 0.8rem',
                                        borderRadius: '20px'
                                    }}>
                                        <span style={{ 
                                            color: '#4a5568',
                                            fontWeight: '500',
                                            fontSize: '0.8rem'
                                        }}>Age:</span>
                                        <span style={{ 
                                            color: '#2c3e50',
                                            fontWeight: '600',
                                            fontSize: '0.9rem'
                                        }}>{ageData.years} {ageData.years !== 'N/A' && `(${ageData.classification})`}</span>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        backgroundColor: '#f0f4f8',
                                        padding: '0.3rem 0.8rem',
                                        borderRadius: '20px'
                                    }}>
                                        <span style={{ 
                                            color: '#4a5568',
                                            fontWeight: '500',
                                            fontSize: '0.8rem'
                                        }}>Gender:</span>
                                        <span style={{ 
                                            color: '#2c3e50',
                                            fontWeight: '600',
                                            fontSize: '0.9rem'
                                        }}>{patient.gender || 'N/A'}</span>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        backgroundColor: '#e6fffa',
                                        padding: '0.3rem 0.8rem',
                                        borderRadius: '20px'
                                    }}>
                                        <span style={{ 
                                            color: '#2c7a7b',
                                            fontWeight: '500',
                                            fontSize: '0.8rem'
                                        }}>Dialysis:</span>
                                        <span style={{ 
                                            color: '#234e52',
                                            fontWeight: '600',
                                            fontSize: '0.9rem'
                                        }}>{patient.dialysisType || 'Peritoneal Dialysis'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                            onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                            style={{
                                background: '#f8f9fa',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                padding: '0.3rem 0.6rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <FiMinus />
                        </button>
                        <button 
                            onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                            style={{
                                background: '#f8f9fa',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                padding: '0.3rem 0.6rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <FiPlus />
                        </button>
                        <button 
                            onClick={generatePDF}
                            disabled={isGeneratingPDF}
                            style={{
                                background: '#e74c3c',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.5rem 1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                opacity: isGeneratingPDF ? 0.7 : 1
                            }}
                        >
                            <FiFileText /> {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                        </button>
                    </div>
                </div>

                <div style={{ padding: '1.5rem' }}>
                    {/* Medical Term Search Section */}
                    <div style={{ 
                        marginBottom: '2rem',
                        backgroundColor: '#f8fafc',
                        borderLeft: '4px solid #6f42c1',
                        padding: '1rem',
                        borderRadius: '4px'
                    }}>
                        <h3 style={{ 
                            color: '#2c3e50',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <FiSearch /> Medical Term Search
                        </h3>
                        
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            marginBottom: '1rem'
                        }}>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search medical terms, drugs, conditions..."
                                style={{
                                    flex: 1,
                                    padding: '0.5rem 1rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem'
                                }}
                                onKeyPress={(e) => e.key === 'Enter' && searchMedicalTerm()}
                            />
                            <button
                                onClick={searchMedicalTerm}
                                disabled={isSearching || !searchTerm.trim()}
                                style={{
                                    background: '#6f42c1',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '0.5rem 1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    opacity: isSearching || !searchTerm.trim() ? 0.7 : 1
                                }}
                            >
                                {isSearching ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                        
                        {medicalResults && (
                        <div style={{
                            backgroundColor: '#fff',
                            borderRadius: '6px',
                            padding: '1rem',
                            border: '1px solid #eee',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ 
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: '1rem'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ 
                                        marginTop: 0, 
                                        color: '#6f42c1',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        {medicalResults.term}
                                        <a 
                                            href={medicalResults.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                color: '#6f42c1',
                                                fontSize: '0.8rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.3rem'
                                            }}
                                        >
                                            View on {medicalResults.source} <FiExternalLink size={14} />
                                        </a>
                                    </h4>
                                    {medicalResults.note && (
                                        <div style={{ 
                                            backgroundColor: '#fff4e5',
                                            padding: '0.5rem',
                                            borderRadius: '4px',
                                            marginBottom: '0.5rem',
                                            fontSize: '0.8rem',
                                            color: '#8a6d3b'
                                        }}>
                                            {medicalResults.note}
                                        </div>
                                    )}
                                    {medicalResults.description ? (
                                        <div style={{ 
                                            color: '#4a5568',
                                            fontSize: '0.9rem',
                                            marginBottom: '0.5rem'
                                        }}>
                                            {medicalResults.description}
                                        </div>
                                    ) : (
                                        <div style={{ 
                                            color: '#4a5568',
                                            fontSize: '0.9rem',
                                            marginBottom: '0.5rem'
                                        }}>
                                            <div><strong>RxNorm ID:</strong> {medicalResults.rxNormId || 'N/A'}</div>
                                            <div><strong>Strength:</strong> {medicalResults.strength || 'N/A'}</div>
                                            <div><strong>Dose Form:</strong> {medicalResults.doseForm || 'N/A'}</div>
                                        </div>
                                    )}
                                    <div style={{ 
                                        fontSize: '0.7rem',
                                        color: '#7f8c8d',
                                        marginTop: '0.5rem'
                                    }}>
                                        Source: {medicalResults.source}
                                    </div>
                                </div>
                                {medicalResults.image && (
                                    <div style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        flexShrink: 0
                                    }}>
                                        <img 
                                            src={medicalResults.image} 
                                            alt={medicalResults.term}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                        
                        {searchError && (
                            <div style={{
                                backgroundColor: '#fff4e5',
                                borderRadius: '6px',
                                padding: '1rem',
                                borderLeft: '3px solid #ffa502',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <FiAlertTriangle style={{ color: '#ffa502' }} />
                                {searchError}
                            </div>
                        )}
                    </div>

                    {/* Doctor's Quick Assessment Section */}
                    <div style={{ 
                        marginBottom: '2rem',
                        backgroundColor: '#f8fafc',
                        borderLeft: '4px solid #3498db',
                        padding: '1rem',
                        borderRadius: '4px'
                    }}>
                        <h3 style={{ 
                            color: '#2c3e50',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <FaNotesMedical /> Doctor's Quick Assessment
                        </h3>
                        
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '1rem'
                        }}>
                            <div style={{
                                backgroundColor: '#fff',
                                borderRadius: '6px',
                                padding: '1rem',
                                border: '1px solid #eee',
                                position: 'relative'
                            }}>
                                <div style={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.5rem',
                                    color: '#2c3e50'
                                }}>
                                    <GiKidneys /> Kidney Function Status
                                </div>
                                <div style={{ 
                                    fontSize: '0.9rem',
                                    color: '#4a5568',
                                    lineHeight: '1.5'
                                }}>
                                    {totalBalance.isPositive ? (
                                        <>
                                            <span style={{ color: '#e53e3e', fontWeight: '500' }}>Fluid Overload Detected</span> - Consider adjusting UF goals. Total fluid retention: {totalBalance.formatted}. Patient may need stricter fluid restrictions.
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ color: '#38a169', fontWeight: '500' }}>Adequate Fluid Removal</span> - Current UF goals appear appropriate. Total fluid removed: {totalBalance.formatted.replace('-', '')}.
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <div style={{
                                backgroundColor: '#fff',
                                borderRadius: '6px',
                                padding: '1rem',
                                border: '1px solid #eee'
                            }}>
                                <div style={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.5rem',
                                    color: '#2c3e50'
                                }}>
                                    <BsDropletHalf /> Fluid Management
                                </div>
                                <div style={{ 
                                    fontSize: '0.9rem',
                                    color: '#4a5568',
                                    lineHeight: '1.5'
                                }}>
                                    {dailyData.filter(day => day.netBalance > 0).length > dailyData.length * 0.3 ? (
                                        <>
                                            <span style={{ color: '#e53e3e', fontWeight: '500' }}>Frequent Fluid Retention</span> - {dailyData.filter(day => day.netBalance > 0).length} of {dailyData.length} days show retention. Review dietary counseling and consider adjusting dialysis prescription.
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ color: '#38a169', fontWeight: '500' }}>Stable Fluid Balance</span> - Patient appears compliant with fluid restrictions. Only {dailyData.filter(day => day.netBalance > 0).length} of {dailyData.length} days show retention.
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <div style={{
                                backgroundColor: '#fff',
                                borderRadius: '6px',
                                padding: '1rem',
                                border: '1px solid #eee'
                            }}>
                                <div style={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.5rem',
                                    color: '#2c3e50'
                                }}>
                                    <FiActivity /> Treatment Frequency
                                </div>
                                <div style={{ 
                                    fontSize: '0.9rem',
                                    color: '#4a5568',
                                    lineHeight: '1.5'
                                }}>
                                    <span style={{ fontWeight: '500' }}>{treatmentFrequency()}</span> - Average fluid removal: {averageFluidRemoval()}. Consider adjusting frequency if symptoms persist.
                                </div>
                            </div>
                            
                            <div style={{
                                backgroundColor: '#fff',
                                borderRadius: '6px',
                                padding: '1rem',
                                border: '1px solid #eee',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                ':hover': {
                                    backgroundColor: '#f0f4f8'
                                }
                            }} onClick={() => setShowFluidGuide(!showFluidGuide)}>
                                <div style={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: showFluidGuide ? '0.5rem' : 0,
                                    color: '#2c3e50'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FiInfo /> Fluid Balance Guide
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#4a5568' }}>
                                        {showFluidGuide ? 'Hide' : 'Show'}
                                    </div>
                                </div>
                                {showFluidGuide && (
                                    <div style={{ 
                                        fontSize: '0.8rem',
                                        color: '#4a5568',
                                        lineHeight: '1.5',
                                        marginTop: '0.5rem'
                                    }}>
                                        <div style={{ marginBottom: '0.3rem' }}>
                                            <span style={{ fontWeight: '500', color: '#38a169' }}>Negative (-) Balance:</span> {fluidGuide.negative}
                                        </div>
                                        <div>
                                            <span style={{ fontWeight: '500', color: '#e53e3e' }}>Positive (+) Balance:</span> {fluidGuide.positive}
                                        </div>
                                        <div style={{ 
                                            marginTop: '0.5rem',
                                            padding: '0.5rem',
                                            backgroundColor: '#fff4e5',
                                            borderRadius: '4px',
                                            borderLeft: '3px solid #ffa502'
                                        }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <FiAlertTriangle style={{ color: '#ffa502', flexShrink: 0 }} />
                                                <div>
                                                    <strong>Clinical Note:</strong> Persistent positive balance may indicate inadequate dialysis, non-compliance with fluid restrictions, or cardiac dysfunction.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ 
                            color: '#2c3e50',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <FiActivity /> Patient Overview
                        </h3>
                        
                        {/* Age Classification Note */}
                        {ageData.isAdult !== null && (
                            <div style={{
                                backgroundColor: ageData.isAdult ? '#e3f2fd' : '#fff8e1',
                                borderLeft: `4px solid ${ageData.isAdult ? '#1976d2' : '#ffa000'}`,
                                padding: '0.8rem 1rem',
                                borderRadius: '4px',
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.9rem'
                            }}>
                                <FiUser style={{ 
                                    color: ageData.isAdult ? '#1976d2' : '#ffa000',
                                    flexShrink: 0 
                                }} />
                                <div>
                                    <strong>{ageData.classification} Patient:</strong> {getAgeClassificationNote()}
                                    {!ageData.isAdult && (
                                        <div style={{ 
                                            fontSize: '0.8rem',
                                            marginTop: '0.3rem',
                                            color: '#5d4037'
                                        }}>
                                            Pediatric considerations: Monitor growth parameters, adjust dialysate composition, and consider specialized pediatric protocols.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                            gap: '1rem'
                        }}>
                            <div style={{
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                padding: '1rem',
                                borderLeft: '4px solid #3498db'
                            }}>
                                <div style={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.5rem',
                                    color: '#3498db'
                                }}>
                                    <FiActivity /> Total Treatments
                                </div>
                                <div style={{ 
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: '#2c3e50'
                                }}>
                                    {patient.treatments.length}
                                </div>
                                <div style={{ 
                                    fontSize: '0.8rem',
                                    color: '#7f8c8d',
                                    marginTop: '0.3rem'
                                }}>
                                    Across {dailyData.length} days
                                </div>
                            </div>
                            
                            <div style={{
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                padding: '1rem',
                                borderLeft: '4px solid #e74c3c'
                            }}>
                                <div style={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.5rem',
                                    color: '#e74c3c'
                                }}>
                                    <FiThermometer /> Fluid Retention Days
                                </div>
                                <div style={{ 
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: '#2c3e50'
                                }}>
                                    {dailyData.filter(day => day.netBalance > 0).length}
                                    <div style={{ 
                                        fontSize: '0.8rem',
                                        color: '#7f8c8d',
                                        marginTop: '0.3rem'
                                    }}>
                                        {Math.round((dailyData.filter(day => day.netBalance > 0).length / dailyData.length) * 100)}% of days
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                padding: '1rem',
                                borderLeft: '4px solid #28a745'
                            }}>
                                <div style={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.5rem',
                                    color: '#28a745'
                                }}>
                                    <FiDroplet /> Net UF (Balance)
                                </div>
                                <div style={{ 
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: totalBalance.isPositive ? '#dc3545' : '#28a745'
                                }}>
                                    {totalBalance.formatted}
                                    <div style={{ 
                                        fontSize: '0.8rem',
                                        color: '#7f8c8d',
                                        marginTop: '0.3rem'
                                    }}>
                                        {totalBalance.interpretation}
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                padding: '1rem',
                                borderLeft: '4px solid #6f42c1'
                            }}>
                                <div style={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.5rem',
                                    color: '#6f42c1'
                                }}>
                                    <FiDroplet /> Average Daily UF
                                </div>
                                <div style={{ 
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: '#2c3e50'
                                }}>
                                    {dailyData.length > 0 
                                        ? (totalBalance.value / dailyData.length > 0 
                                            ? `+${Math.round(totalBalance.value / dailyData.length)}mL`
                                            : `${Math.round(totalBalance.value / dailyData.length)}mL`)
                                        : '0mL'}
                                    <div style={{ 
                                        fontSize: '0.8rem',
                                        color: '#7f8c8d',
                                        marginTop: '0.3rem'
                                    }}>
                                        Per day average
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ 
                            color: '#2c3e50',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <FaRegChartBar /> Treatment History (Last 14 Days)
                        </h3>
                        <div style={{ 
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            padding: '1rem',
                            border: '1px solid #eee',
                            height: '350px'
                        }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                    <XAxis dataKey="date" stroke="#7f8c8d" />
                                    <YAxis yAxisId="left" stroke="#7f8c8d" />
                                    <Tooltip 
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                        formatter={(value, name) => {
                                            if (name === 'netUF') {
                                                const isPositive = value > 0;
                                                return [`${isPositive ? '+' : ''}${value}mL`, name];
                                            }
                                            return [`${value}mL`, name];
                                        }}
                                        labelFormatter={(label) => `Date: ${label}`}
                                    />
                                    <Legend />
                                    <Line 
                                        yAxisId="left"
                                        type="monotone" 
                                        dataKey="volumeIn" 
                                        name="Volume In (mL)" 
                                        stroke="#8884d8" 
                                        strokeWidth={2}
                                        activeDot={{ r: 6 }} 
                                    />
                                    <Line 
                                        yAxisId="left"
                                        type="monotone" 
                                        dataKey="volumeOut" 
                                        name="Volume Out (mL)" 
                                        stroke="#82ca9d" 
                                        strokeWidth={2}
                                    />
                                    <Line 
                                        yAxisId="left"
                                        type="monotone" 
                                        dataKey="netUF" 
                                        name="Net UF (mL)" 
                                        stroke="#ff7300" 
                                        strokeWidth={3}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem'
                        }}>
                            <h3 style={{ 
                                color: '#2c3e50',
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <BsClipboard2Pulse /> Daily Treatment Summary
                            </h3>
                            <div style={{ 
                                fontSize: '0.9rem',
                                color: '#7f8c8d'
                            }}>
                                Showing {Math.min(7, dailyData.length)} of {dailyData.length} days
                            </div>
                        </div>
                        
                        {dailyData.slice(0, 7).map((day, dayIndex) => (
                            <div key={dayIndex} style={{ 
                                marginBottom: '1.5rem',
                                border: '1px solid #eee',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.8rem 1rem',
                                    backgroundColor: '#f8f9fa',
                                    borderBottom: '1px solid #eee'
                                }}>
                                    <div style={{ 
                                        fontWeight: '500',
                                        color: '#2c3e50',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span>{day.formattedDate}</span>
                                        {day.bloodPressure && (
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.3rem',
                                                backgroundColor: '#f0f4f8',
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '4px',
                                                fontSize: '0.8rem'
                                            }}>
                                                <MdBloodtype /> BP: {day.bloodPressure}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem'
                                    }}>
                                        <div style={{ fontSize: '0.9rem' }}>
                                            <span style={{ color: '#7f8c8d' }}>Treatment(s): </span>
                                            <span style={{ fontWeight: '500' }}>{day.treatments.length}</span>
                                        </div>
                                        <div style={{ 
                                            fontWeight: '500',
                                            color: day.netBalance > 0 ? '#dc3545' : '#28a745',
                                            backgroundColor: day.netBalance > 0 ? '#f8d7da' : '#d4edda',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '4px'
                                        }}>
                                            Daily Net Fluid Balance: {day.netBalance > 0 ? `+${day.netBalance}mL` : `${day.netBalance}mL`}
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={{ 
                                    backgroundColor: '#fff',
                                    borderRadius: '0 0 8px 8px'
                                }}>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
                                        padding: '0.8rem 1rem',
                                        backgroundColor: '#f8f9fa',
                                        borderBottom: '1px solid #eee',
                                        fontWeight: '500',
                                        color: '#2c3e50',
                                        fontSize: '0.9rem',
                                        gap: '0.5rem'
                                    }}>
                                        <div>Volume In</div>
                                        <div>Volume Out</div>
                                        <div>
                                            Net UF (Balance)
                                            <div style={{ 
                                                fontSize: '0.7rem',
                                                fontWeight: 'normal',
                                                color: '#7f8c8d'
                                            }}>
                                                Input - Output
                                            </div>
                                        </div>
                                        <div>Color</div>
                                        <div>Notes</div>
                                        <div>Status</div>
                                    </div>
                                    
                                    {day.treatments.map((treatment, index) => {
                                        const statusColor = getStatusColor(treatment.TreatmentStatus);
                                        const colorClass = getColorClass(treatment.Color);
                                        
                                        return (
                                            <div key={index} style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
                                                padding: '0.8rem 1rem',
                                                borderBottom: index === day.treatments.length - 1 ? 'none' : '1px solid #eee',
                                                fontSize: '0.9rem',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <div style={{ fontWeight: '500' }}>
                                                    {treatment.VolumeIn || 0}mL
                                                </div>
                                                <div style={{ fontWeight: '500' }}>
                                                    {treatment.VolumeOut || 0}mL
                                                </div>
                                                <div style={{
                                                    fontWeight: '600',
                                                    color: treatment.balance > 0 ? '#dc3545' : '#28a745'
                                                }}>
                                                    {treatment.formattedBalance}
                                                    <div style={{ 
                                                        fontSize: '0.8rem',
                                                        color: '#7f8c8d',
                                                        fontWeight: 'normal'
                                                    }}>
                                                        {treatment.interpretation}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '0.2rem 0.5rem',
                                                        borderRadius: '4px',
                                                        backgroundColor: colorClass === 'color-clear' ? '#e3f2fd' : 
                                                                    colorClass === 'color-normal' ? '#e8f5e9' : '#ffebee',
                                                        color: colorClass === 'color-clear' ? '#1976d2' : 
                                                            colorClass === 'color-normal' ? '#2e7d32' : '#c62828',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '500'
                                                    }}>
                                                        {treatment.Color || 'N/A'}
                                                    </span>
                                                </div>
                                                <div style={{ 
                                                    fontSize: '0.8rem', 
                                                    color: '#4a5568',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {treatment.Notes || '-'}
                                                </div>
                                                <div>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '0.2rem 0.5rem',
                                                        borderRadius: '4px',
                                                        backgroundColor: `${statusColor}20`,
                                                        color: statusColor,
                                                        fontSize: '0.8rem',
                                                        fontWeight: '500',
                                                        textTransform: 'capitalize'
                                                    }}>
                                                        {treatment.TreatmentStatus || 'Recorded'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDetailModal;