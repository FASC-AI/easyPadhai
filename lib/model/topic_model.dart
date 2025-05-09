class TopicModel {
  int? code;
  bool? status;
  String? message;
  Data? data;

  TopicModel({this.code, this.status, this.message, this.data});

  TopicModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    data = json['data'] != null ? new Data.fromJson(json['data']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['code'] = this.code;
    data['status'] = this.status;
    data['message'] = this.message;
    if (this.data != null) {
      data['data'] = this.data!.toJson();
    }
    return data;
  }
}

class Data {
  String? sId;
  String? topic;
  String? lessonDescription;
  String? lessonTextContent;

  Data({this.sId, this.topic, this.lessonDescription, this.lessonTextContent});

  Data.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    topic = json['topic'];
    lessonDescription = json['lessonDescription'];
    lessonTextContent = json['lessonTextContent'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['topic'] = this.topic;
    data['lessonDescription'] = this.lessonDescription;
    data['lessonTextContent'] = this.lessonTextContent;
    return data;
  }
}
