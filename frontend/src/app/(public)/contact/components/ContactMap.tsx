'use client';

export function ContactMap() {
  return (
    <div className="rounded-lg overflow-hidden border">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.0!2d47.0!3d-21.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDAwJzAwLjAiUyA0N8KwMDAnMDAuMCJF!5e0!3m2!1sfr!2smg!4v1234567890"
        width="100%"
        height="300"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Carte Youth Computing"
      />
    </div>
  );
}