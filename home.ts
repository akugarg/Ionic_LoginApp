import { Component } from '@angular/core';
import { NavController,ToastController,LoadingController,Platform, AlertController } from 'ionic-angular';
import { RegisterPage } from '../register/register';
import { AngularFireAuth } from 'angularfire2/auth'
import { AngularFireDatabase } from 'angularfire2/database';

import { ProfPage } from '../prof/prof';
import { StudentPage } from '../student/student';
import { GlobalProvider } from '../../providers/global/global';
import { AdMobFree, AdMobFreeBannerConfig } from '@ionic-native/admob-free';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  username:string;
  password:string;
  data:any[];
  lock = 0;
  constructor(private admobFree: AdMobFree,
    public navCtrl: NavController,
    private afAuth:AngularFireAuth,
    private toast:ToastController,
    private db:AngularFireDatabase,
    public gvar:GlobalProvider,
    private platform:Platform,
    private storage: Storage,
    private alertCtrl: AlertController,
    public loadingCtrl: LoadingController) {
    
  }
  ionViewDidLoad(){
    this.storage.get('email').then((val) => {
      console.log('Your email is', val);
      this.username = val;
    });
    this.storage.get('passwd').then((val) => {
      console.log('Your passwd is', val);
      this.password = val;
    });
    this.storage.get('role').then((val)=>{
      if(this.username && this.password && val=='student'){
        this.afAuth.auth.signInWithEmailAndPassword(this.username,this.password);
        this.gvar.setcurrentstudent(this.username);
        this.navCtrl.setRoot(StudentPage);
      }
      else if(this.username && this.password && val=='prof'){
        this.afAuth.auth.signInWithEmailAndPassword(this.username,this.password);
        this.gvar.setcurrentprof(this.username);
        this.navCtrl.setRoot(ProfPage);
      }
    })
    if(this.platform.is('cordova')){
      const bannerConfig: AdMobFreeBannerConfig = {
        id:'ca-app-pub-5072323905656927/1247306752',
        isTesting: false,
        autoShow: true
      };
      this.admobFree.banner.config(bannerConfig);
      
      this.admobFree.banner.prepare()
        .then(() => {
          // this.toast.create({
          //   message : 'banner Ad is ready',
          //   duration:3000
          // }).present();
          // banner Ad is ready
          // if we set autoShow to false, then we will need to call the show method here
        })
        .catch(e => console.log(e));
    }
  }

  async login(){
    this.lock = 1;
    console.log("user : " +this.username);
    console.log("passwd : "+this.password);
    try{
     const result = await this.afAuth.auth.signInWithEmailAndPassword(this.username,this.password).then((user) => {
      if(user.user.emailVerified) {

         console.log("email verified");
         this.storage.set('email', this.username);
         this.storage.set('passwd',this.password);
         
           this.db.list("/users").valueChanges().subscribe(data=>{
             if(!this.lock)return;
             this.data = data;
             let i=-1;
             do{
               i++;
             }while(this.data[i].email != this.username);
             console.log("this is the  data : "+this.data[i]);
            //  if(this.data[i].verified != 1){
            //    this.toast.create({
            //      message :'This Email id is not verified !!',
            //      duration:3000
            //    }).present();
            //  }
            this.storage.set('role',this.data[i].role);
             this.lock = 0;
             if(this.data[i].role=="student"){
               console.log("YEah I'm student");
               this.gvar.setcurrentstudent(this.username);
               this.navCtrl.setRoot(StudentPage);
             }
             else{ 
               console.log("YEah I'm prof");
               this.gvar.setcurrentprof(this.username);
               this.navCtrl.setRoot(ProfPage);
             }
           });
        
       
      } else {
        // console.log("user: "+user.user.emailVerified);
        // Tell the user to have a look at its mailbox 
        this.toast.create({
          message : "Email is not verified. Please check inbox",
          duration:3000
        }).present();
      }
    });
    }
    catch(e){
      this.toast.create({
        message : e.message,
        duration:3000
      }).present();
      console.error(e);
    }
  }

  goToRegister(){
    this.navCtrl.push(RegisterPage);
  }
  
  async ForgotPasswd(){
    let alert = this.alertCtrl.create({
    title: 'Reset Password',
    inputs: [
      {
        name: 'email',
        placeholder: 'Email address'
      }
    ],
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: data => {
          console.log('Cancel clicked');
        }
      },
      {
        text: 'OK',
        handler: data => {
          this.afAuth.auth.sendPasswordResetEmail(data.email).then(()=>{
            this.toast.create({
              message : "Mail has been sent. Please check inbox!",
              duration:3000
            }).present();
          })
        }
      }
    ]
  });
  alert.present();
  }
  ResendLink(){
    let alert = this.alertCtrl.create({
      title: 'Resend Link',
      inputs: [
        {
          name: 'email',
          placeholder: 'Email address'
        },
        {
          name: 'password',
          placeholder: 'Password',
          type:'password'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'OK',
          handler: data => {
            this.afAuth.auth.signInWithEmailAndPassword(data.email,data.password);
            this.afAuth.auth.currentUser.sendEmailVerification().then(()=>{
              this.toast.create({
                message : "Mail has been sent. Please check inbox!",
                duration:3000
              }).present();
            })
          }
        }
      ]
    });
    alert.present();
  }
}