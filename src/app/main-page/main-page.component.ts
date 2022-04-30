import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {

  public filterCount: number = 1;
  public listFilter: any = {};
  public displaySidebar: boolean = false;
  public loading: boolean = false;
  public error: boolean = false;
  public sidebarCss: object = {};


  constructor(private modalService: NgbModal) {
    this.modalService.open("content");

  }

  public onSidebarFilter(filter: any): void {
    this.listFilter = filter;
    this.filterCount++;
  }

  public toggleSidebar(value: boolean): void {
    this.displaySidebar = value;
    if (value) {
      this.sidebarCss = {
        position: 'absolute',
        width: '60%',
        'max-width': 'unset',
      };
    } else {
      this.sidebarCss = {};
    }
  }

  public handleListLoad(loading: boolean): void {
    this.loading = loading;
  }

  public handleError(showError: boolean): void {
    this.error = showError;
  }

}
