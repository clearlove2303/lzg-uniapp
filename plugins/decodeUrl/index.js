import Vue from "vue";
import querystring from 'querystring';

const decodeUrl = {
  decode:function(url) {
    let newUrl = url.substring(10);
    newUrl = querystring.parse(newUrl);
    let model = newUrl.m;
    let id = newUrl.id;
    let exam_id = newUrl.exam_id;
    let paper_id = newUrl.paper_id;
    let test_order = newUrl.test_order;
    let paper_title = newUrl.paper_title;
    return {
      model: model,
      params: {
        id: id,
        exam_id: exam_id,
        paper_id: paper_id,
        test_order: test_order,
        paper_title: paper_title,
      }
    }
  }
}
Vue.prototype.decodeUrl = decodeUrl;
export default {};
