'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';

export default function StoryPage() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    setTimeout(() => setIsDownloading(false), 1000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F0' }}>
      {/* Top Bar */}
      <div
        style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #E8E0D0',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#741515',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: '500',
          }}
        >
          <ArrowLeft size={18} />
          Back to library
        </Link>
        <h1 className="font-serif" style={{ fontSize: '1.25rem', color: '#1A1209', margin: 0 }}>
          The Secret of the Whispering Woods
        </h1>
        <button
          className="btn-brand"
          onClick={handleDownloadPDF}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.75rem 1.5rem',
          }}
          disabled={isDownloading}
        >
          <Download size={18} />
          {isDownloading ? 'Downloading...' : 'Download PDF'}
        </button>
      </div>

      {/* Cover Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a3a3a 0%, #2d6a5c 100%)',
          height: '300px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          padding: '40px 20px',
        }}
      >
        <div style={{ fontSize: '5rem', marginBottom: '24px' }}>🌲</div>
        <h2 className="font-serif" style={{ fontSize: '2rem', margin: '0 0 12px', maxWidth: '600px' }}>
          The Secret of the Whispering Woods
        </h2>
        <p style={{ margin: 0, fontSize: '1rem', opacity: 0.9 }}>Leo • March 2026</p>
      </div>

      {/* Story Content */}
      <div style={{ padding: '60px 20px', backgroundColor: 'white' }}>
        <article style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h1 className="font-serif" style={{ fontSize: '2rem', marginBottom: '24px', color: '#1A1209' }}>
            The Secret of the Whispering Woods
          </h1>

          <p style={{ color: '#6B5E4E', fontSize: '0.9rem', marginBottom: '32px', textAlign: 'center' }}>
            A story for Leo • March 2026 • 923 words
          </p>

          <div style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '32px' }}>✦</div>

          <div style={{ lineHeight: 1.8, color: '#1A1209', fontSize: '1rem' }}>
            <p>
              Leo had always wondered what lay beyond the edge of his backyard, where the tall grass gave way to shadows and the world seemed to hold its breath. On a warm afternoon in early spring, when the sun painted everything gold and the air smelled of fresh earth, he decided to find out.
            </p>

            <p>
              The forest began innocently enough—a cluster of birch trees with papery white bark, their branches reaching toward each other like old friends sharing secrets. Leo pushed through, his sneakers crunching on fallen leaves that seemed to whisper as he passed. The deeper he went, the taller the trees grew, their canopies so thick that the sunlight arrived in golden columns, like the windows of some vast, green cathedral.
            </p>

            <p>
              After what felt like hours but was probably only twenty minutes, Leo stumbled into a clearing he'd never seen before. In the center stood an enormous oak tree, so ancient that its trunk was wider than his entire body. Its roots twisted across the forest floor like sleeping serpents, and its branches held what seemed like a thousand different shades of green. As Leo approached, he heard it—a sound so faint he almost missed it. A whispering, like voices carried on the wind, coming from the very heart of the tree.
            </p>

            <p>
              Leo's heart raced, but not from fear. There was something magical about the sound, something that pulled him closer. He pressed his palm against the rough bark of the ancient oak and closed his eyes. The whispering grew louder, clearer, and suddenly he could almost understand it. The trees were speaking—about the forest, about the seasons, about the secret life that thrummed through their roots and branches. They were telling the story of the woods: how they grew from tiny seeds, weathered storms, sheltered animals, and watched generations pass beneath their boughs.
            </p>

            <p>
              When Leo opened his eyes, the sun was beginning to set, painting the sky in shades of orange and purple that seemed impossible. But he wasn't afraid of the darkening forest. He understood now that the woods weren't wild and dangerous—they were alive, aware, and waiting patiently for someone to listen. The whispering continued, and Leo began to realize that every sound in the forest had meaning: the snap of a branch was a tree stretching after a long winter, the rustle of leaves was their laughter, the distant call of a bird was an invitation to explore further.
            </p>

            {/* Illustration 2 */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0a2540 0%, #1a5a7a 100%)',
                height: '250px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                margin: '40px 0',
                color: 'white',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🐋</div>
                <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>A moment of wonder and discovery</p>
              </div>
            </div>

            <p>
              As darkness began to creep through the forest, Leo knew he had to head home. His mother would be worried, and school was tomorrow. But he left the clearing reluctantly, turning back several times to look at the great oak one more time. He promised himself he would return—not just to listen to the whispering, but to learn more, to understand the secret language that trees use to speak to each other across the centuries.
            </p>

            <p>
              The walk home was different now. Every footstep felt like a conversation with the forest. The trees seemed to nod as he passed, their branches swaying gently even though there was no wind. When Leo finally emerged from the woods and saw his backyard, the familiar sight seemed somehow less familiar. He had been changed by what he'd experienced—opened somehow, made aware of a whole world operating beneath the surface of the everyday.
            </p>

            <p>
              That night, Leo lay in bed unable to sleep. His mind was full of oak trees and golden light, of voices in the wind and secrets held in the hearts of forests. He thought about how the world was so much bigger and stranger and more wonderful than he'd ever realized. In the dark, quiet comfort of his room, he made a decision: tomorrow after school, he would go back to the woods. He would bring a notebook and try to write down what the trees were saying. He would become a translator of forest language, a keeper of its secrets.
            </p>

            <p>
              But he didn't know yet that the forest had already chosen him for something greater—that his discovery of the whispering woods was just the beginning of an adventure that would span seasons and years, and that the ancient oak would become his closest friend and most trusted advisor. That night, as Leo finally drifted off to sleep, the forest was whispering still, calling softly through the darkness, waiting for him to return and unlock the greatest secret of all: that magic isn't something you find in fairy tales and storybooks. Magic is everywhere, in every tree and stone and drop of water, waiting for someone young enough to believe in it and brave enough to listen.
            </p>
          </div>

          <div style={{ textAlign: 'center', fontSize: '1.5rem', marginTop: '40px', marginBottom: '40px' }}>✦</div>
        </article>
      </div>

      {/* Bottom Sticky Bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderTop: '1px solid #E8E0D0',
          padding: '16px 20px',
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          zIndex: 10,
        }}
      >
        <button
          className="btn-brand"
          onClick={handleDownloadPDF}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.75rem' }}
        >
          <Download size={18} />
          Download PDF
        </button>
        <button
          className="btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.75rem' }}
        >
          Order a printed copy — $28
        </button>
      </div>

      {/* Spacer for sticky bar */}
      <div style={{ height: '80px' }} />
    </div>
  );
}
