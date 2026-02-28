import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    QRCode: any;
  }
}

export default function SuccessPage({
  hospital,
  onNewSearch,
}: {
  hospital: any;
  onNewSearch: () => void;
}) {
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    appointmentTime: '',
  });

  // Generate QR code
  useEffect(() => {
    if (qrContainerRef.current && window.QRCode && hospital) {
      qrContainerRef.current.innerHTML = '';
      const qrData = `HOSPITAL:${hospital?.name || 'Hospital'}|ADDRESS:${hospital?.address || 'Address'}|PHONE:${hospital?.phone || 'Phone'}`;
      new window.QRCode(qrContainerRef.current, {
        text: qrData,
        width: 150,
        height: 150,
      });
    }
  }, [hospital]);

  // Load QR Code library
  useEffect(() => {
    if (!window.QRCode) {
      const script = document.createElement('script');
      script.src =
        'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
      script.onload = () => {
        if (qrContainerRef.current && window.QRCode && hospital) {
          qrContainerRef.current.innerHTML = '';
          const qrData = `HOSPITAL:${hospital?.name || 'Hospital'}|ADDRESS:${hospital?.address || 'Address'}|PHONE:${hospital?.phone || 'Phone'}`;
          new window.QRCode(qrContainerRef.current, {
            text: qrData,
            width: 150,
            height: 150,
          });
        }
      };
      document.head.appendChild(script);
    }
  }, [hospital]);

  const handleBookingSubmit = () => {
    console.log('[v0] Booking submitted:', bookingData);
    setShowBookingModal(false);
    setBookingData({ name: '', phone: '', appointmentTime: '' });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8 pt-4">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-foreground mb-2 font-sans">
            Hospital Selected
          </h1>
          <p className="text-muted-foreground font-sans">
            You're all set to visit this hospital
          </p>
        </div>

        {/* Hospital Info Card */}
        {hospital && (
          <div className="bg-card p-6 rounded-lg border border-border mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 font-sans">
              {hospital?.name || 'Hospital'}
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-primary text-lg">📍</span>
                <div>
                  <p className="text-xs text-muted-foreground font-sans">
                    ADDRESS
                  </p>
                  <p className="text-sm text-foreground font-sans">
                    {hospital?.address || 'Address not available'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary text-lg">📞</span>
                <div>
                  <p className="text-xs text-muted-foreground font-sans">PHONE</p>
                  <p className="text-sm text-foreground font-sans">
                    {hospital?.phone || 'Phone not available'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary text-lg">📏</span>
                <div>
                  <p className="text-xs text-muted-foreground font-sans">
                    DISTANCE
                  </p>
                  <p className="text-sm text-foreground font-sans">
                    {(hospital?.distance || 0).toFixed(1)} km away
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary text-lg">⭐</span>
                <div>
                  <p className="text-xs text-muted-foreground font-sans">
                    RATING
                  </p>
                  <p className="text-sm text-foreground font-sans">
                    {hospital?.rating || 0} / 5.0
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Code */}
        <div className="bg-card p-6 rounded-lg border border-border mb-6 text-center">
          <p className="text-sm text-muted-foreground mb-4 font-sans">
            Show this code at the hospital
          </p>
          <div
            ref={qrContainerRef}
            className="flex justify-center items-center bg-white p-4 rounded-lg inline-block w-full"
          ></div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          <Button
            onClick={() => setShowBookingModal(true)}
            className="w-full bg-primary hover:bg-primary/90 text-white font-sans"
          >
            Book Appointment
          </Button>
          <Button
            onClick={onNewSearch}
            variant="outline"
            className="w-full font-sans"
          >
            Search Again
          </Button>
        </div>

        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background p-6 rounded-lg max-w-md w-full border border-border">
              <h2 className="text-xl font-bold text-foreground mb-4 font-sans">
                Book Appointment
              </h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm text-muted-foreground font-sans mb-1 block">
                    Name
                  </label>
                  <input
                    type="text"
                    value={bookingData.name}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, name: e.target.value })
                    }
                    placeholder="Your name"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground font-sans text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground font-sans mb-1 block">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={bookingData.phone}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, phone: e.target.value })
                    }
                    placeholder="Your phone"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground font-sans text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground font-sans mb-1 block">
                    Preferred Time
                  </label>
                  <input
                    type="datetime-local"
                    value={bookingData.appointmentTime}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        appointmentTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground font-sans text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleBookingSubmit}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-sans"
                >
                  Confirm
                </Button>
                <Button
                  onClick={() => setShowBookingModal(false)}
                  variant="outline"
                  className="flex-1 font-sans"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
