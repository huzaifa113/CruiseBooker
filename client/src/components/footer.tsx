import { Ship, Facebook, Twitter, Instagram, Youtube, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 ocean-gradient rounded-lg flex items-center justify-center">
                <Ship className="text-white w-5 h-5" />
              </div>
              <h3 className="text-white font-bold text-lg">Phoenix Vacation Group</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Creating unforgettable cruise experiences for over 25 years. Your luxury vacation starts here.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                data-testid="link-facebook"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                data-testid="link-twitter"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                data-testid="link-instagram"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                data-testid="link-youtube"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Cruise Destinations */}
          <div>
            <h4 className="text-white font-semibold mb-4">Cruise Destinations</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-caribbean">
                  Caribbean
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-mediterranean">
                  Mediterranean
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-alaska">
                  Alaska
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-northern-europe">
                  Northern Europe
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-asia">
                  Asia
                </a>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/reservations">
                  <a className="hover:text-white transition-colors" data-testid="link-my-reservations">
                    My Reservations
                  </a>
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-contact">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-faq">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-travel-insurance">
                  Travel Insurance
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-special-needs">
                  Special Needs
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-3 text-ocean-400 flex-shrink-0" />
                <span data-testid="contact-phone">+66 2 123 4567</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-ocean-400 flex-shrink-0" />
                <span data-testid="contact-email">info@phoenixvacations.com</span>
              </div>
              <div className="flex items-start">
                <MapPin className="w-4 h-4 mr-3 text-ocean-400 flex-shrink-0 mt-1" />
                <span data-testid="contact-address">
                  123 Silom Road<br />
                  Bangkok, Thailand 10500
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400 mb-4 md:mb-0" data-testid="copyright">
            © 2024 Phoenix Vacation Group. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="link-privacy">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="link-terms">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="link-sitemap">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
