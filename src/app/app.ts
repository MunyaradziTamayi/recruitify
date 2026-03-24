declare var google: any;

import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('recruitify');

  private navSub?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.navSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.cleanupOneTap());
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  private cleanupOneTap(): void {
    try {
      if (typeof google !== 'undefined' && google?.accounts?.id) {
        google.accounts.id.cancel();
      }
    } catch {
      // ignore
    }

    const selectors = [
      'div.g_id_prompt',
      '#credential_picker_container',
      '#g_id_onload',
      'iframe[src*="accounts.google.com/gsi"]',
    ];

    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => el.remove());
    });
  }
}
