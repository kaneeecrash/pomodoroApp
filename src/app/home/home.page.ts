import { Component, OnInit } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';  // For notifications
import { Haptics } from '@capacitor/haptics';  // For haptic feedback
import { Platform } from '@ionic/angular';  // To manage back button behavior
import { App } from '@capacitor/app';  // Import Capacitor App plugin for exitApp

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {
  currentTime: string = ''; // Real-time clock
  timeLeft: number = 25 * 60; // 25 minutes for Pomodoro session
  breakTimeLeft: number = 5 * 60; // 5 minutes for break
  timer: any;
  isPomodoroActive: boolean = false;
  isBreakActive: boolean = false;
  isPaused: boolean = false;

  constructor(private platform: Platform) {}

  ngOnInit(): void {
    // Real-time clock display
    this.updateCurrentTime();
    setInterval(() => {
      this.updateCurrentTime();
    }, 1000);

    // Handle hardware back button
    this.platform.backButton.subscribeWithPriority(10, () => {
      App.exitApp();  // Exit the app when back button is pressed
    });
  }

  // Update the current time
  updateCurrentTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString();
  }

  // Calculate the progress percentage for conic-gradient
  getProgressPercentage(): number {
    let progress = 0;

    // Check if Pomodoro session is active
    if (this.isPomodoroActive && this.timeLeft > 0) {
      progress = (this.timeLeft / (25 * 60)) * 100; // Calculate percentage for Pomodoro
    } 
    // Check if Break session is active
    else if (this.isBreakActive && this.breakTimeLeft > 0) {
      progress = (this.breakTimeLeft / (5 * 60)) * 100; // Calculate percentage for break
    } 
    // In case of no active session, return 0
    else {
      progress = 0;
    }

    return progress;
  }

  // Start the Pomodoro cycle
  startPomodoro() {
    if (this.isPaused) {
      this.resumeTimer();
    } else {
      this.isPomodoroActive = true;
      this.isBreakActive = false;
      this.timeLeft = 25 * 60; // 25 minutes
      this.startTimer();
    }
  }

  // Start the break after Pomodoro (after 3 seconds pause)
  startBreak() {
    setTimeout(() => {
      this.isPomodoroActive = false;
      this.isBreakActive = true;
      this.breakTimeLeft = 5 * 60; // 5 minutes
      this.startTimer();
    }, 3000); // Wait for 3 seconds before starting the break
  }

  // Start the countdown timer
  startTimer() {
    this.timer = setInterval(() => {
      if (this.isPomodoroActive && this.timeLeft > 0) {
        this.timeLeft--;
      } else if (this.isBreakActive && this.breakTimeLeft > 0) {
        this.breakTimeLeft--;
      } else {
        this.timerComplete();
      }
    }, 1000);
  }

  // Pause the timer
  pauseTimer() {
    clearInterval(this.timer);
    this.isPaused = true;
  }

  // Resume the timer
  resumeTimer() {
    this.isPaused = false;
    this.startTimer();
  }

  // Handle the timer completion
  async timerComplete() {
    if (this.isPomodoroActive) {
      // Show the notification immediately when the Pomodoro session completes
      await this.notify('Pomodoro Complete!', 'Time for a 5-minute break.');
      Haptics.vibrate();  // Provide vibration feedback
      this.startBreak();  // Start the break after Pomodoro with 3-second delay
    } else if (this.isBreakActive) {
      // Show the notification when the break is complete
      await this.notify('Break Complete!', 'Back to work!');
      Haptics.vibrate();  // Provide vibration feedback
      this.resetTimer();  // Reset timer after the break
    }
  }

  // Send a notification to the user with alarm sound and icon
  async notify(title: string, body: string) {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: title,
          body: body,
          id: new Date().getMilliseconds(),
          schedule: { at: new Date(Date.now() + 1000) },  // Schedule after 1 second
          sound: 'assets/alarm-clock.mp3',  // Custom alarm clock sound (ensure the path is correct)
          // icon: 'alarm.jpg',  // Alarm icon (you can use your own icon if needed)
        },
      ],
    });
  }

  // Reset the timer for a new Pomodoro cycle
  resetTimer() {
    this.timeLeft = 25 * 60; // Reset to 25 minutes
    this.breakTimeLeft = 5 * 60; // Reset to 5 minutes
    this.isPomodoroActive = false;
    this.isBreakActive = false;
  }

  // Format the time to be displayed as m:ss
  getFormattedTime(): string {
    let minutes: number;
    let seconds: number;

    if (this.isPomodoroActive) {
      minutes = Math.floor(this.timeLeft / 60);
      seconds = this.timeLeft % 60;
    } else if (this.isBreakActive) {
      minutes = Math.floor(this.breakTimeLeft / 60);
      seconds = this.breakTimeLeft % 60;
    } else {
      return '00:00';
    }

    // Ensure two digits for seconds
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }
}
