'use client';
import { useAppStore } from '@/lib/store';
import { useEffect } from 'react';

function launchConfetti() {
  if (typeof window === 'undefined') return;
  const colors = ['#4F8EF7', '#FF6B6B', '#FFB800', '#22D3A6', '#8B5CF6'];
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.style.cssText = `position:fixed;width:10px;height:10px;border-radius:2px;pointer-events:none;z-index:9999;left:${Math.random()*100}vw;top:-20px;background:${colors[Math.floor(Math.random()*colors.length)]};transform:rotate(${Math.random()*360}deg);animation:confettiDrop ${1.5+Math.random()*2}s ease forwards;animation-delay:${Math.random()*.5}s`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 4000);
  }
}

export default function Modal() {
  const { modal, closeModal } = useAppStore();

  useEffect(() => {
    if (modal?.show) launchConfetti();
  }, [modal?.show]);

  if (!modal) return null;

  return (
    <div className={`aka-modal-overlay${modal.show ? ' show' : ''}`} onClick={closeModal}>
      <div className="aka-modal" onClick={e => e.stopPropagation()}>
        <div className="aka-modal-emoji">{modal.emoji}</div>
        <div className="aka-modal-title">{modal.title}</div>
        <div className="aka-modal-body">{modal.body}</div>
        <button className="aka-modal-btn" onClick={closeModal}>Awesome! ⭐</button>
      </div>
    </div>
  );
}
