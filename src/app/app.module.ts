import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MatButtonModule } from '@angular/material/button'; // Material button module
import { LocalNotifications } from '@capacitor/local-notifications';  // Notifications module
import { Haptics } from '@capacitor/haptics'; // Haptic feedback module

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    MatButtonModule, // Material Button
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
