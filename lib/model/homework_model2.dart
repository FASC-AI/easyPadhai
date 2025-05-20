class HomeworkModel2 {
  int? code;
  bool? status;
  String? message;
  List<HomeworkModel2Data>? data;

  HomeworkModel2({this.code, this.status, this.message, this.data});

  HomeworkModel2.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    if (json['data'] != null) {
      data = <HomeworkModel2Data>[];
      json['data'].forEach((v) {
        data!.add(new HomeworkModel2Data.fromJson(v));
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

class HomeworkModel2Data {
  String? publishedDate;
  List<Homework2>? homework;

  HomeworkModel2Data({this.publishedDate, this.homework});

  HomeworkModel2Data.fromJson(Map<String, dynamic> json) {
    publishedDate = json['publishedDate'];
    if (json['homework'] != null) {
      homework = <Homework2>[];
      json['homework'].forEach((v) {
        homework!.add(new Homework2.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['publishedDate'] = this.publishedDate;
    if (this.homework != null) {
      data['homework'] = this.homework!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class Homework2 {
  String? question;
  String? solution;
  String? hint;

  Homework2({this.question, this.solution, this.hint});

  Homework2.fromJson(Map<String, dynamic> json) {
    question = json['question'];
    solution = json['solution'];
    hint = json['hint'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['question'] = this.question;
    data['solution'] = this.solution;
    data['hint'] = this.hint;
    return data;
  }
}
