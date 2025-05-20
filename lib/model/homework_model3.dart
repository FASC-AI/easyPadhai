class HomeworkModel3 {
  int? code;
  bool? status;
  String? message;
  List<HomeworkModel3Data>? data;

  HomeworkModel3({this.code, this.status, this.message, this.data});

  HomeworkModel3.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    if (json['data'] != null) {
      data = <HomeworkModel3Data>[];
      json['data'].forEach((v) {
        data!.add(new HomeworkModel3Data.fromJson(v));
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

class HomeworkModel3Data {
  String? sId;
  List<String>? subjectId;
  List<String>? classId;
  List<String>? lessonId;
  List<String>? bookId;
  List<String>? topicId;
  bool? isPublished;
  String? question;
  String? solution;
  String? videoTutorialLink;
  String? hint;
  String? createdBy;
  String? updatedBy;
  String? createdAt;
  String? updatedAt;
  int? iV;
  String? publishedBy;
  String? publishedDate;

  HomeworkModel3Data(
      {this.sId,
      this.subjectId,
      this.classId,
      this.lessonId,
      this.bookId,
      this.topicId,
      this.isPublished,
      this.question,
      this.solution,
      this.videoTutorialLink,
      this.hint,
      this.createdBy,
      this.updatedBy,
      this.createdAt,
      this.updatedAt,
      this.iV,
      this.publishedBy,
      this.publishedDate});

  HomeworkModel3Data.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    subjectId = json['subjectId'].cast<String>();
    classId = json['classId'].cast<String>();
    lessonId = json['lessonId'].cast<String>();
    bookId = json['bookId'].cast<String>();
    topicId = json['topicId'].cast<String>();
    isPublished = json['isPublished'];
    question = json['question'];
    solution = json['solution'];
    videoTutorialLink = json['videoTutorialLink'];
    hint = json['hint'];
    createdBy = json['createdBy'];
    updatedBy = json['updatedBy'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    iV = json['__v'];
    publishedBy = json['publishedBy'];
    publishedDate = json['publishedDate'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['subjectId'] = this.subjectId;
    data['classId'] = this.classId;
    data['lessonId'] = this.lessonId;
    data['bookId'] = this.bookId;
    data['topicId'] = this.topicId;
    data['isPublished'] = this.isPublished;
    data['question'] = this.question;
    data['solution'] = this.solution;
    data['videoTutorialLink'] = this.videoTutorialLink;
    data['hint'] = this.hint;
    data['createdBy'] = this.createdBy;
    data['updatedBy'] = this.updatedBy;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['__v'] = this.iV;
    data['publishedBy'] = this.publishedBy;
    data['publishedDate'] = this.publishedDate;
    return data;
  }
}
