declare interface RequestOptions {
  name: string;
  params: any;
  data: any;
  url: string,
  method: string,
  headers: any,
}

declare function request(options: RequestOptions): Promise;

export = request;
