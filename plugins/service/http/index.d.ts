declare interface RequestOptions {
  name: string;
  params: any;
  data: any;
  url: string,
  method: string,
  headers: any,
}

type RequestFunc = (options: RequestOptions) => Promise;

declare class Http {
  private request: RequestFunc;

  constructor(client: RequestFunc) {
    this.request = client;
  }

  get(options: RequestOptions): Promise;
  post(options: RequestOptions): Promise;
  patch(options: RequestOptions): Promise;
  put(options: RequestOptions): Promise;
  delete(options: RequestOptions): Promise;
  head(options: RequestOptions): Promise;
}

export default Http;
