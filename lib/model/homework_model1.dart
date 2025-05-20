class HomeworkModel1 {
  int? code;
  bool? status;
  String? message;
  HomeworkModel1Data? data;

  HomeworkModel1({this.code, this.status, this.message, this.data});

  HomeworkModel1.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    data = json['data'] != null ? new HomeworkModel1Data.fromJson(json['data']) : null;
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

class HomeworkModel1Data {
  List<Homework>? homework;

  HomeworkModel1Data({this.homework});

  HomeworkModel1Data.fromJson(Map<String, dynamic> json) {
    if (json['homework'] != null) {
      homework = <Homework>[];
      json['homework'].forEach((v) {
        homework!.add(new Homework.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.homework != null) {
      data['homework'] = this.homework!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class Homework {
  String? id;
  String? question;
  String? solution;
  String? hint;
  String? videoTutorialLink;
  String? createdBy;
  String? updatedBy;
  String? createdAt;
  String? updatedAt;
  bool? isPublished;

  Homework(
      {this.id,
      this.question,
      this.solution,
      this.hint,
      this.videoTutorialLink,
      this.createdBy,
      this.updatedBy,
      this.createdAt,
      this.updatedAt,
      this.isPublished});

  Homework.fromJson(Map<String, dynamic> json) {
    id = json['id'];
    question = json['question'];
    solution = json['solution'];
    hint = json['hint'];
    videoTutorialLink = json['videoTutorialLink'];
    createdBy = json['createdBy'];
    updatedBy = json['updatedBy'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    isPublished = json['isPublished'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['id'] = this.id;
    data['question'] = this.question;
    data['solution'] = this.solution;
    data['hint'] = this.hint;
    data['videoTutorialLink'] = this.videoTutorialLink;
    data['createdBy'] = this.createdBy;
    data['updatedBy'] = this.updatedBy;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['isPublished'] = this.isPublished;
    return data;
  }
}
