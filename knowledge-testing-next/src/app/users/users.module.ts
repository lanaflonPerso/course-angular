import {MatInputModule, MatSelectModule, MatButtonModule, MatListModule, MatIconModule, MatCardModule} from '@angular/material';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserListComponent } from './user-list/user-list.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UserService } from './user.service';
import { SimpleReactiveComponent } from './simple-reactive/simple-reactive.component';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatCardModule
  ],
  declarations: [UserListComponent, UserDetailComponent, SimpleReactiveComponent],
  exports: [UserListComponent],
  providers: [UserService]
})
export class UsersModule { }
