import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CommonService } from './common.service';
import { PetProfile } from '../models/PetProfile.model';
import { Authentication } from '../models/Authentication.model';
import { apiConstant } from '../constants/api.constant';
import { Data } from '../models/Data.model';
import { LastTopicRead } from '../models/LastTopicRead.model';

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

  updatePetProfile(data: PetProfile) {
    return this.httpClient.post(
      `${this.backendUrl}${apiConstant.UPDATE_PET_PROFILE}`,
      data
    );
  }

  getPetProfile() {
    return this.httpClient.get(
      `${this.backendUrl}${apiConstant.GET_PET_PROFILE}`
    );
  }

  getLastTopicRead() {
    return this.httpClient.get(
      `${this.backendUrl}${apiConstant.GET_LAST_TOPIC_READ}`
    );
  }

  updateLastTopicRead(data: LastTopicRead) {
    return this.httpClient.post(
      `${this.backendUrl}${apiConstant.UPDATE_LAST_TOPIC_READ}`,
      data
    );
  }

  getHTML(data: Data) {
    return this.httpClient.post(
      `${this.backendUrl}${apiConstant.GET_DATA_BY_TITLE}`,
      data
    );
  }

  getCourseDetails() {
    return this.httpClient.get(
      `${this.backendUrl}${apiConstant.GET_COURSE_DETAILS}`
    );
  }
}
