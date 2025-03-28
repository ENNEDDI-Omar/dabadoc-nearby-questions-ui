
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoritesListComponent } from '../../components/favorites/favorites-list/favorites-list.component';
import { HeaderComponent } from '../../shared/layouts/header/header.component';
import { FooterComponent } from '../../shared/layouts/footer/footer.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FavoritesListComponent,
    HeaderComponent,
    FooterComponent
  ],
  template: `
    <app-header></app-header>
    <app-favorites-list></app-favorites-list>
    <app-footer></app-footer>
  `
})
export class FavoritesComponent {}
