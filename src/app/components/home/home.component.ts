import { Component, OnInit } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/all';
gsap.registerPlugin(ScrollTrigger, TextPlugin);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  ngOnInit(): void {
    this.initGsap();
  }
  initGsap(): void {
    gsap.timeline({
      scrollTrigger: {
        trigger: '.hero',
        start: 'center center',
        end: '+=400',
        scrub: 1,
      },
    });

    gsap.from('.hero', {
      scale: 0,
      ease: 'expo.inOut',
      animationDuration: 0.7,
      smoothOrigin: true,
    });

    gsap.to('.hero', {
      scale: 1,
      ease: 'expo.inOut',
      smoothOrigin: true,
      onComplete: () => {
        gsap.from('.hero', {
          scale: 0,
          ease: 'expo.inOut',
          animationDuration: 1,
          smoothOrigin: true,
          animationDelay: 1,
          transitionDelay: 1,
          transitionDuration: 1,
          text: 'Pawfection!',
        });
        gsap.to('.hero', {
          scale: 1,
          ease: 'expo.inOut',
          transitionDuration: 2,
          smoothOrigin: true,
          animationDelay: 2,
          transitionDelay: 2,
          text: 'Dog Trainer',
        });
      },
    });

    gsap.from('.figure', {
      opacity: 0,
      scale: 1,
      ease: 'expo.in',
      animationDuration: 0.7,
      smoothOrigin: true,
    });

    gsap.to('.figure', {
      opacity: 0.3,
      scale: 1,
      ease: 'expo.out',
      animationDelay: 0.6,
      transitionDelay: 0.6,
      transitionDuration: 1,
      smoothOrigin: true,
    });
  }
}
