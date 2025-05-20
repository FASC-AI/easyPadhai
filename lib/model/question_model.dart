class OnlineQuesmodel {
  int? code;
  bool? status;
  String? message;
  List<OnlineQuesmodelData>? data;

  OnlineQuesmodel({this.code, this.status, this.message, this.data});

  OnlineQuesmodel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    if (json['data'] != null) {
      data = <OnlineQuesmodelData>[];
      json['data'].forEach((v) {
        data!.add(new OnlineQuesmodelData.fromJson(v));
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

class OnlineQuesmodelData {
  String? sId;
  String? codee;
  bool? isActive;
  bool? isPublished;
  String? type;
  String? testType;
  String? questionType;
  String? description;
  String? descriptionSol;
  List<Classes>? classes;
  // List<Subjects>? subjects;
  // List<Book>? book;
  // List<Lesson>? lesson;
  // List<Topic>? topic;
  bool? option1;
  bool? option2;
  bool? option3;
  bool? option4;
  String? mark1;
  String? mark2;
  String? mark3;
  String? mark4;
  String? totalTrue;
  bool? optionAssertion1;
  bool? optionAssertion2;
  bool? optionAssertion3;
  bool? optionAssertion4;
  String? markAssertion1;
  String? markAssertion2;
  String? markAssertion3;
  String? markAssertion4;
  String? optionTrue;
  String? markTrue;
  String? optionFalse;
  String? markFalse;
  String? createdAt;
  String? updatedAt;
  int? code;
  int? iV;

  OnlineQuesmodelData(
      {this.sId,
      this.codee,
      this.isActive,
      this.isPublished,
      this.type,
      this.testType,
      this.questionType,
      this.description,
      this.descriptionSol,
      this.classes,
      // this.subjects,
      // this.book,
      // this.lesson,
      // this.topic,
      this.option1,
      this.option2,
      this.option3,
      this.option4,
      this.mark1,
      this.mark2,
      this.mark3,
      this.mark4,
      this.totalTrue,
      this.optionAssertion1,
      this.optionAssertion2,
      this.optionAssertion3,
      this.optionAssertion4,
      this.markAssertion1,
      this.markAssertion2,
      this.markAssertion3,
      this.markAssertion4,
      this.optionTrue,
      this.markTrue,
      this.optionFalse,
      this.markFalse,
      this.createdAt,
      this.updatedAt,
      this.code,
      this.iV});

  OnlineQuesmodelData.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    codee = json['codee'];
    isActive = json['isActive'];
    isPublished = json['isPublished'];
    type = json['type'];
    testType = json['testType'];
    questionType = json['questionType'];
    description = json['description'];
    descriptionSol = json['descriptionSol'];
    if (json['classes'] != null) {
      classes = <Classes>[];
      json['classes'].forEach((v) {
        classes!.add(new Classes.fromJson(v));
      });
    }
    // if (json['subjects'] != null) {
    //   subjects = <Subjects>[];
    //   json['subjects'].forEach((v) {
    //     subjects!.add(new Subjects.fromJson(v));
    //   });
    // }
    // if (json['book'] != null) {
    //   book = <Book>[];
    //   json['book'].forEach((v) {
    //     book!.add(new Book.fromJson(v));
    //   });
    // }
    // if (json['lesson'] != null) {
    //   lesson = <Lesson>[];
    //   json['lesson'].forEach((v) {
    //     lesson!.add(new Lesson.fromJson(v));
    //   });
    // }
    // if (json['topic'] != null) {
    //   topic = <Topic>[];
    //   json['topic'].forEach((v) {
    //     topic!.add(new Topic.fromJson(v));
    //   });
    // }
    option1 = json['option1'];
    option2 = json['option2'];
    option3 = json['option3'];
    option4 = json['option4'];
    mark1 = json['mark1'];
    mark2 = json['mark2'];
    mark3 = json['mark3'];
    mark4 = json['mark4'];
    totalTrue = json['totalTrue'];
    optionAssertion1 = json['optionAssertion1'];
    optionAssertion2 = json['optionAssertion2'];
    optionAssertion3 = json['optionAssertion3'];
    optionAssertion4 = json['optionAssertion4'];
    markAssertion1 = json['markAssertion1'];
    markAssertion2 = json['markAssertion2'];
    markAssertion3 = json['markAssertion3'];
    markAssertion4 = json['markAssertion4'];
    optionTrue = json['optionTrue'];
    markTrue = json['markTrue'];
    optionFalse = json['optionFalse'];
    markFalse = json['markFalse'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    code = json['code'];
    iV = json['__v'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['codee'] = this.codee;
    data['isActive'] = this.isActive;
    data['isPublished'] = this.isPublished;
    data['type'] = this.type;
    data['testType'] = this.testType;
    data['questionType'] = this.questionType;
    data['description'] = this.description;
    data['descriptionSol'] = this.descriptionSol;
    if (this.classes != null) {
      data['classes'] = this.classes!.map((v) => v.toJson()).toList();
    }
    // if (this.subjects != null) {
    //   data['subjects'] = this.subjects!.map((v) => v.toJson()).toList();
    // }
    // if (this.book != null) {
    //   data['book'] = this.book!.map((v) => v.toJson()).toList();
    // }
    // if (this.lesson != null) {
    //   data['lesson'] = this.lesson!.map((v) => v.toJson()).toList();
    // }
    // if (this.topic != null) {
    //   data['topic'] = this.topic!.map((v) => v.toJson()).toList();
    // }
    data['option1'] = this.option1;
    data['option2'] = this.option2;
    data['option3'] = this.option3;
    data['option4'] = this.option4;
    data['mark1'] = this.mark1;
    data['mark2'] = this.mark2;
    data['mark3'] = this.mark3;
    data['mark4'] = this.mark4;
    data['totalTrue'] = this.totalTrue;
    data['optionAssertion1'] = this.optionAssertion1;
    data['optionAssertion2'] = this.optionAssertion2;
    data['optionAssertion3'] = this.optionAssertion3;
    data['optionAssertion4'] = this.optionAssertion4;
    data['markAssertion1'] = this.markAssertion1;
    data['markAssertion2'] = this.markAssertion2;
    data['markAssertion3'] = this.markAssertion3;
    data['markAssertion4'] = this.markAssertion4;
    data['optionTrue'] = this.optionTrue;
    data['markTrue'] = this.markTrue;
    data['optionFalse'] = this.optionFalse;
    data['markFalse'] = this.markFalse;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['code'] = this.code;
    data['__v'] = this.iV;
    return data;
  }
}

class Classes {
  String? sId;
  String? nameEn;

  Classes({this.sId, this.nameEn});

  Classes.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    nameEn = json['nameEn'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['nameEn'] = this.nameEn;
    return data;
  }
}
