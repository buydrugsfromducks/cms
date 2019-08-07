declare module 'react-cms' {
  export interface IAppMenu {
    menuPath: string;
  }

  export interface IUserData {
    name: string;
    eventName: string;
    eventID: number;
    enabled: number;
    updated_at: number;
    lastUpdate: number;
    eventTimeShift: number;
  }

  export interface IUser {
    user_screen_name: string;
    code: number;
    user_id: string;
    user_name: string;
    expired: number;
    appdata: IUserData;
  }

  export interface IMenu {
    id: number;
    name: string;
    pic: string;
    position: number;
    module: number;
    customColor: number;
    color: string;
    enabled: number;
    visible: number;
    lastUpdate: number;
    payload: string;
  }

  export interface IModule {
    name: string;
    id: string;
  }

  export interface IAppIcon {
    id: number;
    url: string;
  }

  export interface IContainer {
    data: INews | any;
    module: number | null;
    isLoading: boolean;
    id: number | null;
  }

  export interface IPeople {
    id: number;
    name: string;
    description: string;
    img: string;
    mobile: string;
    updated_at: number;
  }

  export interface IEvent {
    id: number;
    name: string;
    privacy: number;
    mainStyle: number;
    H1: string;
    descShort: string;
    locationId: number;
    locationName: string;
    timeShift: number;
    multidays: number;
    mainImage: string;
    enabled: number;
    starttime: number;
    endtime: number;
  }

  export interface INews {
    announce: string;
    body: string;
    id: number;
    img: string;
    time: number;
    title: string;
    visible: number;
  }

  export interface IPeopleList {
    id: number;
    people_group: number;
    people_group_name: string;
    people_id: number;
    visible: number;
    data: { id: number; img: string; name: string; updated_at: number; people_id: number; };
  }

  export interface ICompanyList {
    id: number;
    visible: number;
    company_id: number;
    company_group: number;
  }

  export interface ICompany {
    id: number;
    img: string;
    name: string;
    announce: string;
    description: string;
    deleted: number;
  }

  export interface ICompanyGroup {
    id: number;
    name: string;
    deleted: number;
  }

  export interface ICompanyJoin {
    id: number;
    visible: number;
    company_id: number;
    company_group: number;
    img: string;
    companyName: string;
    companyGroupName: string;
    announce: string;
    description: string;
    announceFull: string;
    descriptionFull: string;
  }

  export interface IIcon {
    url: string;
    id: number;
  }

  export interface ILocation {
    address: string;
    deleted: number;
    description: string;
    id: number;
    latitude: number;
    longitude: number;
    updated_at: number;
    name: string;
  }

  export interface IProgramModulePeople {
    appId: string;
    created_at: string;
    deleted: string;
    description: string;
    id: string;
    img: string;
    mobile: string;
    name: string;
    peopleId: string;
    people_group: string;
    programId: string;
    updated_at: string;
  }

  export interface IProgramModule {
    description: string;
    finish: number;
    id: number;
    inviteonly: number;
    location_id: number;
    location_name: string;
    peoples: IProgramModulePeople[];
    rating: number;
    start: number;
    updated_at: number;
    title: string;
    visible: boolean;
  }

  export interface ICompany {
    name: string;
    description: string;
    img: string;
    announce: string;
    updated_at: number;
  }

  export interface IPollList {
    deleted: number;
    enabled: number;
    id: number;
    name: string;
    updated_at: number;
    visible: boolean;
  }

  export interface IFilesList {
    code: number;
    data: Array<any>;
    id: number;
    url: string;
    url_small: string;
    w: number;
    h: number;
    size: number;
    created_at: number;

  }
  export interface IAppsList {
    id: number;
    is_owner: number;
    role: number;
    name: string;
    aid: string;
    eventID: number;
    env_production: number;
    event_name: string;
    pic: any;
  }


  export type EnumTarget = 'company' | 'people' | 'company_groups' | 'people_groups' | 'icons' | 'locations' | 'poll' | 'filemanager';
  export type EnumType = 'PUT' | 'POST' | 'DELETE';
  export type UploadType = 'people' | 'company' | 'ico' | 'misc';
}
