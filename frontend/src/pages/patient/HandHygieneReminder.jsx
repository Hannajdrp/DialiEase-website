import React from 'react';
import {
  FaHands,
  FaFaucet,
} from 'react-icons/fa';
import {
  BsDropletHalf,
  BsEmojiSmile,
} from 'react-icons/bs';
import {
  HiOutlineEmojiHappy,
} from 'react-icons/hi';
import {
  MdSoap,
  MdOutlineWavingHand,
} from 'react-icons/md';
import {
  GiSoapExperiment,
  GiHand,
  GiSparkles,
} from 'react-icons/gi';
import {
  RiHandHeartLine,
} from 'react-icons/ri';
import {
  FiAlertCircle,
} from 'react-icons/fi';
import {
  LuHandPlatter,
} from 'react-icons/lu';

const iconColor = 'var(--color-primary)';

const steps = [
  { icon: <FaFaucet style={{ color: iconColor }} />, text: 'Wet hands with clean running water' },
  { icon: <MdSoap style={{ color: iconColor }} />, text: 'Apply enough soap to cover your hands' },
  { icon: <FaHands style={{ color: iconColor }} />, text: 'Rub hands palm to palm' },
  { icon: <GiSoapExperiment style={{ color: iconColor }} />, text: 'Lather between your fingers' },
  { icon: <GiHand style={{ color: iconColor }} />, text: 'Scrub back of fingers' },
  { icon: <MdOutlineWavingHand style={{ color: iconColor }} />, text: 'Rub the backs of each hand' },
  { icon: <RiHandHeartLine style={{ color: iconColor }} />, text: 'Clean thumbs thoroughly' },
  { icon: <LuHandPlatter style={{ color: iconColor }} />, text: 'Wash fingernails and fingertips' },
  { icon: <BsDropletHalf style={{ color: iconColor }} />, text: 'Rub each wrist with opposite hand' },
  { icon: <HiOutlineEmojiHappy style={{ color: iconColor }} />, text: 'Rinse hands and wrists thoroughly' },
  { icon: <BsEmojiSmile style={{ color: iconColor }} />, text: 'Dry hands with a single-use towel' },
  { icon: <GiSparkles style={{ color: iconColor }} />, text: 'Your hands are now clean and safe' },
];

const HandHygieneReminder = () => {
  return (
    <div style={{
      backgroundColor: 'transparent',
      padding: '32px',
      borderRadius: '16px',
      marginTop: '40px',
      color: 'var(--color-primary)',
      fontFamily: 'Arial, sans-serif',
    }}>
      <style>
        {`
          :root {
            --color-primary: #395886;
            --color-secondary: #638ECB;
            --color-white: #FFFFFF;
            --color-green: #477977;
          }
        `}
      </style>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '24px',
        gap: '12px',
        justifyContent: 'center'
      }}>
        <FiAlertCircle style={{ fontSize: '28px', color: 'var(--color-primary)' }} />
        <h2 style={{ margin: 0, fontSize: '26px' }}>Hand Hygiene Reminder</h2>
      </div>

      <p style={{
        fontStyle: 'italic',
        margin: '0 auto 28px',
        backgroundColor: 'var(--color-green)',
        padding: '14px 18px',
        borderRadius: '10px',
        color: 'var(--color-white)',
        maxWidth: '600px',
        textAlign: 'center',
        fontSize: '16px'
      }}>
        Proper handwashing can help prevent infections.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '24px',
        justifyItems: 'center'
      }}>
        {steps.map((step, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: 'var(--color-white)',
              color: '#333',
              borderRadius: '14px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              borderTop: `5px solid var(--color-green)`,
              textAlign: 'center',
              minHeight: '160px',
              width: '100%',
              maxWidth: '260px'
            }}
          >
            <div style={{ fontSize: '34px', marginBottom: '14px' }}>
              {step.icon}
            </div>
            <div style={{ fontSize: '15px', lineHeight: '1.4' }}>{step.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HandHygieneReminder;
