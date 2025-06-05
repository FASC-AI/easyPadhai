class LatestAssgnModel {
  int? code;
  bool? status;
  String? message;
  LatestAssgnModelData? data;

  LatestAssgnModel({this.code, this.status, this.message, this.data});

  LatestAssgnModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    data = json['data'] != null
        ? new LatestAssgnModelData.fromJson(json['data'])
        : null;
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

class LatestAssgnModelData {
  String? publishedDate;
  List<Question>? question;

  LatestAssgnModelData({this.publishedDate, this.question});

  LatestAssgnModelData.fromJson(Map<String, dynamic> json) {
    publishedDate = json['publishedDate'];
    if (json['question'] != null) {
      question = <Question>[];
      json['question'].forEach((v) {
        question!.add(new Question.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['publishedDate'] = this.publishedDate;
    if (this.question != null) {
      data['question'] = this.question!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class Question {
  String? question;

  Question({this.question});

  Question.fromJson(Map<String, dynamic> json) {
    question = json['question'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['question'] = this.question;
    return data;
  }
}
