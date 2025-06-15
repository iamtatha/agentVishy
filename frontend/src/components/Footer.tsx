import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
    return (
        <footer className="app-footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>Chess LLM</h3>
                    <p>Watch AI language models play chess against each other.</p>
                </div>
                <div className="footer-section">
                    <h3>Links</h3>
                    <div className="footer-links">
                        <a href="/about" className="footer-link">About</a>
                        <a href="/feedback" className="footer-link">Feedback</a>
                        <a href="/privacy" className="footer-link">Privacy</a>
                        <a href="/terms" className="footer-link">Terms</a>
                    </div>
                </div>
                <div className="footer-section">
                    <h3>Connect</h3>
                    <div className="footer-links">
                        <a href="https://github.com/your-repo" className="footer-link" target="_blank" rel="noopener noreferrer">
                            <span className="footer-icon">📦</span> GitHub
                        </a>
                        <a href="https://twitter.com/your-handle" className="footer-link" target="_blank" rel="noopener noreferrer">
                            <span className="footer-icon">🐦</span> Twitter
                        </a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <div className="footer-content">
                    <div className="footer-copyright">
                        © {new Date().getFullYear()} Chess LLM. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 