import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CommonService } from './common.service';
import { Authentication } from '../models/Authentication.model';
import { apiConstant } from '../constants/api.constant';
import { Data } from '../models/Data.model';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  private backendUrl = environment.backendUrl;

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {}

  authentication(data: Authentication) {
    return this.httpClient.post(
      `${this.backendUrl}${apiConstant.AUTHENTICATION}`,
      data,
      {
        observe: 'response',
      }
    );
  }

  fetchHTML(data: Data) {
    return this.httpClient.post(
      `${this.backendUrl}${apiConstant.GET_DATA_BY_TITLE}`,
      data
    );
  }

  fetchCourseDetails() {
    return this.httpClient.get(
      `${this.backendUrl}${apiConstant.GET_COURSE_DETAILS}`
    );
  }
}