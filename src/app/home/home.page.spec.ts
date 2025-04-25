import { Component, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  currentTime: string = '';
  countdown: string = '25:00';
  isRunning: boolean = false;
  private timerSubscription: Subscription | undefined;
  private workDuration = 25 * 60; // 25 minutes in seconds
  private breakDuration = 5 * 60; // 5 minutes in seconds
  private timeLeft = this.workDuration;
  private onBreak = false;


  constructor(private platform: Platform) {}

  ngOnInit() {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);

    // Request permission for notifications
    LocalNotifications.requestPermissions();

    // Listen for hardware back button and exit the app
    this.platform.backButton.subscribeWithPriority(10, () => {
      if (!this.isRunning) {
        App.exitApp();
      }
    });
  }

  updateClock() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString();
  }

  startPomodoro() {
    const now = new Date();
    this.isRunning = true;
    this.timeLeft = this.workDuration;
    this.onBreak = false;
    this.runTimer();
  }

  runTimer() {
    this.updateCountdownDisplay();

    this.timerSubscription = interval(1000).subscribe(() => {
      this.timeLeft--;
      this.updateCountdownDisplay();

      if (this.timeLeft <= 0) {
        this.timerSubscription?.unsubscribe();
        this.fireNotification(this.onBreak ? 'Break has ended!' : 'Work session completed!');

        if (!this.onBreak) {
          // Start 5-minute break
          this.timeLeft = this.breakDuration;
          this.onBreak = true;
          this.runTimer();
        } else {
          // End of Pomodoro cycle
          this.resetTimer();
        }
      }
    });
  }

  updateCountdownDisplay() {
    const minutes = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
    const seconds = (this.timeLeft % 60).toString().padStart(2, '0');
    this.countdown = `${minutes}:${seconds}`;
  }

  async fireNotification(message: string) {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Pomodoro Timer',
          body: message,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) },
          sound: 'baz.wav', // Optional: Add a sound file or keep null for default
          smallIcon: 'res://ic_launcher',
          iconColor: '#FF5E57'
        }
      ]
    });

    // Optional vibration
    if (navigator.vibrate) {
      navigator.vibrate(1000);
    }
  }

  resetTimer() {
    this.countdown = '25:00';
    this.isRunning = false;
    this.onBreak = false;
  }
}
