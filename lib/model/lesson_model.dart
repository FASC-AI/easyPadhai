class LessonModel {
  int? code;
  bool? status;
  String? message;
  List<LData>? data;

  LessonModel({this.code, this.status, this.message, this.data});

  LessonModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    if (json['data'] != null) {
      data = <LData>[];
      json['data'].forEach((v) {
        data!.add(new LData.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['code'] = this.code;
    data['status'] = this.status;
    data['message'] = this.message;
    if (this.data != null) {
      data['data'] = this.data!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class LData {
  String? sId;
  String? lesson;
  bool? status;
  List<Topics>? topics;
  String? lessonDescription;
  String? videoTutorialLink;

  LData(
      {this.sId,
      this.lesson,
      this.status,
      this.topics,
      this.lessonDescription,
      this.videoTutorialLink});

  LData.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    lesson = json['lesson'];
    status = json['status'];
    if (json['topics'] != null) {
      topics = <Topics>[];
      json['topics'].forEach((v) {
        topics!.add(new Topics.fromJson(v));
      });
    }
    lessonDescription = json['lessonDescription'];
    videoTutorialLink = json['videoTutorialLink'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['lesson'] = this.lesson;
    data['status'] = this.status;
    if (this.topics != null) {
      data['topics'] = this.topics!.map((v) => v.toJson()).toList();
    }
    data['lessonDescription'] = this.lessonDescription;
    data['videoTutorialLink'] = this.videoTutorialLink;
    return data;
  }
}

class Topics {
  String? sId;
  String? topic;
  bool? status;

  Topics({this.sId, this.topic, this.status});

  Topics.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    topic = json['topic'];
    status = json['status'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['topic'] = this.topic;
    data['status'] = this.status;
    return data;
  }
}
