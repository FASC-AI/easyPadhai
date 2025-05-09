class TpupdateModel {
  int? code;
  bool? status;
  String? message;
  tpData? data;

  TpupdateModel({this.code, this.status, this.message, this.data});

  TpupdateModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    data = json['data'] != null ? new tpData.fromJson(json['data']) : null;
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

class tpData {
  List<Lessons>? lessons;

  tpData({this.lessons});

  tpData.fromJson(Map<String, dynamic> json) {
    if (json['lessons'] != null) {
      lessons = <Lessons>[];
      json['lessons'].forEach((v) {
        lessons!.add(new Lessons.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.lessons != null) {
      data['lessons'] = this.lessons!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class Lessons {
  String? sId;
  String? lesson;
  bool? status;
  List<Topics>? topics;

  Lessons({this.sId, this.lesson, this.status, this.topics});

  Lessons.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    lesson = json['lesson'];
    status = json['status'];
    if (json['topics'] != null) {
      topics = <Topics>[];
      json['topics'].forEach((v) {
        topics!.add(new Topics.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['lesson'] = this.lesson;
    data['status'] = this.status;
    if (this.topics != null) {
      data['topics'] = this.topics!.map((v) => v.toJson()).toList();
    }
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
