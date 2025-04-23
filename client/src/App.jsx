import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation  } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useTheme } from './components/theme-provider';
import { Button } from './components/ui/button';
import { ModeToggle } from './components/mode-toggle';
import { PrivacyPolicy } from './PrivacyPolicy';
import { TermsOfService } from './TermsOfService';
import './App.css';

// Firebase configuration
const firebaseConfig = {
  databaseURL: "https://ai-projects-d261b-default-rtdb.firebaseio.com/"
};
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/appointments" element={<AppointmentHistory />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Routes>
        <Footer />
        <ChatBot />
      </div>
    </Router>
  );
}

// Add this in Navbar component inside nav-links div
function Navbar() {
  const { theme } = useTheme();
  const { user } = useUser();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${theme}`}>
      <div className="navbar-container">
        <Link to="/" className="logo">
          <h1>MedBook</h1>
        </Link>

        <div className="nav-links">
          <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
          <Link to="/appointments" className={isActive('/appointments') ? 'active' : ''}>My Appointments</Link>
          <Link to="/doctor-dashboard" className={isActive('/doctor-dashboard') ? 'active' : ''}>Doctor Dashboard</Link>
          <Link to="/about" className={isActive('/about') ? 'active' : ''}>About</Link>

          <div className="auth-section">
            <SignedOut>
              <SignInButton>
                <Button className="sign-in-btn">Sign In</Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton afterSignOutUrl="/" />
              {user && <span className="user-greeting">Hi, {user.firstName}</span>}
            </SignedIn>

            <div className="theme-toggle-container">
              <ModeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function HomePage() {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    specialties: 0,
  });

  useEffect(() => {
    // Animate counting up
    const targetStats = {
      doctors: 125,
      patients: 8500,
      specialties: 15,
    };

    const duration = 2000; // 2 seconds
    const frameDuration = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameDuration);

    let frame = 0;
    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;

      setStats({
        doctors: Math.floor(targetStats.doctors * progress),
        patients: Math.floor(targetStats.patients * progress),
        specialties: Math.floor(targetStats.specialties * progress),
      });

      if (frame === totalFrames) {
        clearInterval(counter);
      }
    }, frameDuration);

    return () => clearInterval(counter);
  }, []);

  return (
    <div className="home-page">
      <div className="hero-slider">
        <Slider {...sliderSettings}>
          <div className="slide">
            <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt="Doctor 1" />
            <div className="slide-content">
              <h2>Book Your Doctor Appointment</h2>
              <p>Easy, fast and secure</p>
            </div>
          </div>
          <div className="slide">
            <img src="https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt="Doctor 2" />
            <div className="slide-content">
              <h2>Find the Right Specialist</h2>
              <p>Connect with top doctors in your area</p>
            </div>
          </div>
          <div className="slide">
            <img src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt="Doctor 3" />
            <div className="slide-content">
              <h2>Take Care of Your Health</h2>
              <p>Regular check-ups are important</p>
            </div>
          </div>
        </Slider>
      </div>

      <div className="stats-section">
        <div className="stat-card">
          <h3>Qualified Doctors</h3>
          <div className="count">{stats.doctors.toLocaleString()}+</div>
        </div>
        <div className="stat-card">
          <h3>Satisfied Patients</h3>
          <div className="count">{stats.patients.toLocaleString()}+</div>
        </div>
        <div className="stat-card">
          <h3>Medical Specialties</h3>
          <div className="count">{stats.specialties.toLocaleString()}</div>
        </div>
      </div>

      {/* Add new AI Health Tools section */}
      <div className="ai-health-tools">
        <h2>AI-Powered Health Tools</h2>
        <p className="tools-description">
          Harness the power of AI to predict, prevent, and improve your health with our specialized tools.
        </p>
        
        <div className="tools-container">
          <a href="https://huggingface.co/spaces/LusmicSam/disease-prediction" target="_blank" rel="noopener noreferrer" className="tool-card">
            <div className="tool-icon">🔬</div>
            <h3>Disease Prediction</h3>
            <p>AI-powered tool to predict potential health conditions based on your symptoms</p>
            <button className="tool-btn">Try Now</button>
          </a>
          
          <a href="https://v0-lifestyle-disease-prediction.vercel.app/" target="_blank" rel="noopener noreferrer" className="tool-card">
            <div className="tool-icon">💪</div>
            <h3>Lifestyle Disease Prediction</h3>
            <p>Advanced analysis of lifestyle factors to predict and prevent potential health issues</p>
            <button className="tool-btn">Try Now</button>
          </a>
        </div>
      </div>

      <div className="features-section">
        <div className="feature">
          <i className="icon">🏥</i>
          <h3>Wide Range of Specialties</h3>
          <p>From general medicine to specialized care</p>
        </div>
        <div className="feature">
          <i className="icon">⏱️</i>
          <h3>Flexible Scheduling</h3>
          <p>Book appointments at your convenience</p>
        </div>
        <div className="feature">
          <i className="icon">🔒</i>
          <h3>Secure & Private</h3>
          <p>Your health information is protected</p>
        </div>
      </div>

      <div className="how-it-works">
        <h2>How MedBook Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Find a Doctor</h3>
            <p>Search by specialty or doctor name</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Select Time</h3>
            <p>Choose from available time slots</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Book Appointment</h3>
            <p>Confirm your details and book</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Get Reminders</h3>
            <p>Receive confirmation and reminders</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppointmentHistory() {
  const { user } = useUser();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      console.log(user.primaryEmailAddress.emailAddress);
      const sanitizedEmail = user.primaryEmailAddress.emailAddress.replace(/\./g, '_');
      const appointmentRef = ref(database, `Doctor_Appointment_System/appointment_details/${sanitizedEmail}`);

      onValue(appointmentRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const appointmentsArray = Object.values(data);
          setAppointments(appointmentsArray);
        } else {
          setAppointments([]);
        }
        setLoading(false);
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="appointment-history">
        <h2>My Appointments</h2>
        <div className="sign-in-prompt">
          <p>Please sign in to view your appointment history</p>
          <SignInButton>
            <Button>Sign In</Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="appointment-history">
        <h2>My Appointments</h2>
        <p>Loading your appointments...</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="appointment-history">
        <h2>My Appointments</h2>
        <p>No appointments found. Book a new appointment using our chatbot!</p>
      </div>
    );
  }

  return (
    <div className="appointment-history">
      <h2>My Appointments</h2>
      <div className="appointments-grid">
        {appointments.map((appointment, index) => (
          <div key={index} className="appointment-card">
            <h3>Dr. {appointment.doctor_name.split('Dr. ')[1]}</h3>
            <div className="appointment-details">
              <p><strong>Specialty:</strong> {appointment.specialty}</p>
              <p><strong>Date:</strong> {appointment.appointment_date}</p>
              <p><strong>Time:</strong> {appointment.time_slot}</p>
              <p><strong>Reason:</strong> {appointment.reason}</p>
              <p><strong>Status:</strong> Confirmed</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="about-page">
      <h2>About MedBook</h2>
      <p className="about-description">
        MedBook was created to make healthcare more accessible by connecting patients with doctors quickly and easily.
        Our platform ensures you get the right care when you need it.
      </p>

      <h3>Our Team</h3>
      <div className="developers-grid">
        <div className="developer-card">
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Yash Chauhan" />
          <h4>Yash Chauhan</h4>
          <p className="role">Backend Developer</p>
          <p className="bio">UID: 12311578</p>
          <p className="contact">Email: yschauhan51118@gmail.com</p>
          <p className="contact">Phone: 6398550137</p>
          <p className="address">Lovely Professional University, Punjab-144411, India</p>
        </div>
        
        <div className="developer-card">
          <img src="https://randomuser.me/api/portraits/men/44.jpg" alt="Shivam Panjolia" />
          <h4>Shivam Panjolia</h4>
          <p className="role">Lead Developer</p>
          <p className="bio">UID: 12307980</p>
          <p className="contact">Email: shivampanjolia8@gmail.com</p>
          <p className="contact">Phone: 8580818588</p>
          <p className="address">Lovely Professional University, Punjab-144411, India</p>
        </div>
        
        <div className="developer-card">
          <img src="https://randomuser.me/api/portraits/men/75.jpg" alt="Aryan Raj" />
          <h4>Aryan Raj</h4>
          <p className="role">Frontend Developer</p>
          <p className="bio">UID: 12310453</p>
          <p className="contact">Email: ryanra2607j@gmail.com</p>
          <p className="contact">Phone: 9060091493</p>
          <p className="address">Lovely Professional University, Punjab-144411, India</p>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>MedBook</h3>
          <p>Your health, our priority.</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/appointments">My Appointments</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/privacy-policy#start">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service#start">Terms of Service</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <ul>
            <li>Email: support@medbook.com</li>
            <li>Phone: +1 (555) 987-6543</li>
            <li>Address: 123 Health St, Medical City</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} MedBook. All rights reserved.</p>
      </div>
    </footer>
  );
}

function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hello! I'm your medical appointment assistant. How can I help you today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useUser();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = { sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:3000/api/doctor-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: inputValue,
          sessionId: sessionId,
          userEmail: user?.primaryEmailAddress?.emailAddress
        }),
      });

      const data = await response.json();
      if (!sessionId) {
        setSessionId(data.sessionId);
      }

      setMessages(prev => [...prev, { sender: 'bot', text: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I'm having trouble connecting. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      <button className="chatbot-icon" onClick={() => setIsOpen(!isOpen)}>
        <span className="icon">🩺</span>
      </button>

      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h3>Medical Appointment Assistant</h3>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="message bot typing">
                <span className="typing-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;


function DoctorDashboard() {
  const sampleAppointments = [
    {
      patientName: "John Smith",
      age: 45,
      date: "2024-02-20",
      time: "10:00 AM",
      reason: "Annual Check-up",
      status: "Confirmed",
      contact: "john.smith@email.com"
    },
    {
      patientName: "Sarah Johnson",
      age: 32,
      date: "2024-02-20",
      time: "11:30 AM",
      reason: "Fever and Headache",
      status: "Confirmed",
      contact: "sarah.j@email.com"
    },
    {
      patientName: "Mike Wilson",
      age: 28,
      date: "2024-02-20",
      time: "2:00 PM",
      reason: "Follow-up",
      status: "Pending",
      contact: "mike.w@email.com"
    },
    {
      patientName: "Emily Davis",
      age: 55,
      date: "2024-02-21",
      time: "9:30 AM",
      reason: "Blood Pressure Check",
      status: "Confirmed",
      contact: "emily.d@email.com"
    }
  ];

  return (
    <div className="doctor-dashboard">
      <div className="dashboard-header">
        <h2>Doctor's Dashboard</h2>
        <div className="doctor-info">
          <img src="https://randomuser.me/api/portraits/men/36.jpg" alt="Doctor" className="doctor-avatar" />
          <div className="doctor-details">
            <h3>Dr. James Wilson</h3>
            <p>Cardiologist</p>
            <p>ID: DOC-2024-001</p>
          </div>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-box">
          <h4>Today's Appointments</h4>
          <span className="stat-number">4</span>
        </div>
        <div className="stat-box">
          <h4>Pending Reviews</h4>
          <span className="stat-number">2</span>
        </div>
        <div className="stat-box">
          <h4>Total Patients</h4>
          <span className="stat-number">156</span>
        </div>
      </div>

      <div className="appointments-section">
        <h3>Today's Schedule</h3>
        <div className="appointments-table">
          {sampleAppointments.map((appointment, index) => (
            <div key={index} className="appointment-row">
              <div className="appointment-time">
                <h4>{appointment.time}</h4>
                <p>{appointment.date}</p>
              </div>
              <div className="patient-info">
                <h4>{appointment.patientName}</h4>
                <p>Age: {appointment.age}</p>
                <p>Reason: {appointment.reason}</p>
              </div>
              <div className="appointment-status">
                <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                  {appointment.status}
                </span>
                <button className="action-btn">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}