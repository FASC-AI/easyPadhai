class OfflineTestList {
  int? code;
  bool? status;
  String? message;
  List<OfflineTestListData>? data;

  OfflineTestList({this.code, this.status, this.message, this.data});

  OfflineTestList.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    if (json['data'] != null) {
      data = <OfflineTestListData>[];
      json['data'].forEach((v) {
        data!.add(new OfflineTestListData.fromJson(v));
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

class OfflineTestListData {
  Instructions? instructions;
  QuestionCounts? questionCounts;
  String? sId;
  String? subjectId;
  String? topicId;
  String? lessonId;
  String? classId;
  String? bookId;
  List<TestIds>? testIds;
  String? duration;
  String? session;
  String? date;
  int? totalMarks;
  String? createdBy;
//  List<Null>? groupedQuestions;
  String? createdAt;
  String? updatedAt;
  int? iV;

  OfflineTestListData(
      {this.instructions,
      this.questionCounts,
      this.sId,
      this.subjectId,
      this.topicId,
      this.lessonId,
      this.classId,
      this.bookId,
      this.testIds,
      this.duration,
      this.session,
      this.date,
      this.totalMarks,
      this.createdBy,
      //  this.groupedQuestions,
      this.createdAt,
      this.updatedAt,
      this.iV});

  OfflineTestListData.fromJson(Map<String, dynamic> json) {
    instructions = json['instructions'] != null
        ? new Instructions.fromJson(json['instructions'])
        : null;
    questionCounts = json['questionCounts'] != null
        ? new QuestionCounts.fromJson(json['questionCounts'])
        : null;
    sId = json['_id'];
    subjectId = json['subjectId'];
    topicId = json['topicId'];
    lessonId = json['lessonId'];
    classId = json['classId'];
    bookId = json['bookId'];
    if (json['testIds'] != null) {
      testIds = <TestIds>[];
      json['testIds'].forEach((v) {
        testIds!.add(new TestIds.fromJson(v));
      });
    }
    duration = json['duration'];
    session = json['session'];
    date = json['date'];
    totalMarks = json['totalMarks'];
    createdBy = json['createdBy'];
    // if (json['groupedQuestions'] != null) {
    //   groupedQuestions = <Null>[];
    //   json['groupedQuestions'].forEach((v) {
    //     groupedQuestions!.add(new Null.fromJson(v));
    //   });
    // }
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    iV = json['__v'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.instructions != null) {
      data['instructions'] = this.instructions!.toJson();
    }
    if (this.questionCounts != null) {
      data['questionCounts'] = this.questionCounts!.toJson();
    }
    data['_id'] = this.sId;
    data['subjectId'] = this.subjectId;
    data['topicId'] = this.topicId;
    data['lessonId'] = this.lessonId;
    data['classId'] = this.classId;
    data['bookId'] = this.bookId;
    if (this.testIds != null) {
      data['testIds'] = this.testIds!.map((v) => v.toJson()).toList();
    }
    data['duration'] = this.duration;
    data['session'] = this.session;
    data['date'] = this.date;
    data['totalMarks'] = this.totalMarks;
    data['createdBy'] = this.createdBy;
    // if (this.groupedQuestions != null) {
    //   data['groupedQuestions'] =
    //       this.groupedQuestions!.map((v) => v.toJson()).toList();
    // }
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['__v'] = this.iV;
    return data;
  }
}

class Instructions {
  String? description;

  Instructions({this.description});

  Instructions.fromJson(Map<String, dynamic> json) {
    description = json['description'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['description'] = this.description;
    return data;
  }
}

class QuestionCounts {
  int? mcq;
  int? trueFalse;
  int? descriptive;
  int? assertionReason;

  QuestionCounts(
      {this.mcq, this.trueFalse, this.descriptive, this.assertionReason});

  QuestionCounts.fromJson(Map<String, dynamic> json) {
    mcq = json['mcq'];
    trueFalse = json['trueFalse'];
    descriptive = json['descriptive'];
    assertionReason = json['assertionReason'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['mcq'] = this.mcq;
    data['trueFalse'] = this.trueFalse;
    data['descriptive'] = this.descriptive;
    data['assertionReason'] = this.assertionReason;
    return data;
  }
}

class TestIds {
  String? sId;
  String? codee;
  bool? isActive;
  String? type;
  String? testType;
  String? questionType;
  String? description;
  String? descriptionSol;
  List<Classes>? classes;
  List<Subjects>? subjects;
  List<Book>? book;
  List<Lesson>? lesson;
  List<Topic>? topic;
  bool? option1;
  bool? option2;
  bool? option3;
  bool? option4;
  String? mark1;
  String? mark2;
  String? mark3;
  String? mark4;
  String? totalTrue;
  String? optionText1;
  String? optionText2;
  String? optionText3;
  String? optionText4;
  String? optionAssertionText1;
  String? optionAssertionText2;
  String? optionAssertionText3;
  String? optionAssertionText4;
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
  bool? isLast;

  TestIds(
      {this.sId,
      this.codee,
      this.isActive,
      this.type,
      this.testType,
      this.questionType,
      this.description,
      this.descriptionSol,
      this.classes,
      this.subjects,
      this.book,
      this.lesson,
      this.topic,
      this.option1,
      this.option2,
      this.option3,
      this.option4,
      this.mark1,
      this.mark2,
      this.mark3,
      this.mark4,
      this.totalTrue,
      this.optionText1,
      this.optionText2,
      this.optionText3,
      this.optionText4,
      this.optionAssertionText1,
      this.optionAssertionText2,
      this.optionAssertionText3,
      this.optionAssertionText4,
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
      this.iV,
      this.isLast});

  TestIds.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    codee = json['codee'];
    isActive = json['isActive'];
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
    if (json['subjects'] != null) {
      subjects = <Subjects>[];
      json['subjects'].forEach((v) {
        subjects!.add(new Subjects.fromJson(v));
      });
    }
    if (json['book'] != null) {
      book = <Book>[];
      json['book'].forEach((v) {
        book!.add(new Book.fromJson(v));
      });
    }
    if (json['lesson'] != null) {
      lesson = <Lesson>[];
      json['lesson'].forEach((v) {
        lesson!.add(new Lesson.fromJson(v));
      });
    }
    if (json['topic'] != null) {
      topic = <Topic>[];
      json['topic'].forEach((v) {
        topic!.add(new Topic.fromJson(v));
      });
    }
    option1 = json['option1'];
    option2 = json['option2'];
    option3 = json['option3'];
    option4 = json['option4'];
    mark1 = json['mark1'];
    mark2 = json['mark2'];
    mark3 = json['mark3'];
    mark4 = json['mark4'];
    totalTrue = json['totalTrue'];
    optionText1 = json['optionText1'];
    optionText2 = json['optionText2'];
    optionText3 = json['optionText3'];
    optionText4 = json['optionText4'];
    optionAssertionText1 = json['optionAssertionText1'];
    optionAssertionText2 = json['optionAssertionText2'];
    optionAssertionText3 = json['optionAssertionText3'];
    optionAssertionText4 = json['optionAssertionText4'];
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
    isLast = json['isLast'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['codee'] = this.codee;
    data['isActive'] = this.isActive;
    data['type'] = this.type;
    data['testType'] = this.testType;
    data['questionType'] = this.questionType;
    data['description'] = this.description;
    data['descriptionSol'] = this.descriptionSol;
    if (this.classes != null) {
      data['classes'] = this.classes!.map((v) => v.toJson()).toList();
    }
    if (this.subjects != null) {
      data['subjects'] = this.subjects!.map((v) => v.toJson()).toList();
    }
    if (this.book != null) {
      data['book'] = this.book!.map((v) => v.toJson()).toList();
    }
    if (this.lesson != null) {
      data['lesson'] = this.lesson!.map((v) => v.toJson()).toList();
    }
    if (this.topic != null) {
      data['topic'] = this.topic!.map((v) => v.toJson()).toList();
    }
    data['option1'] = this.option1;
    data['option2'] = this.option2;
    data['option3'] = this.option3;
    data['option4'] = this.option4;
    data['mark1'] = this.mark1;
    data['mark2'] = this.mark2;
    data['mark3'] = this.mark3;
    data['mark4'] = this.mark4;
    data['totalTrue'] = this.totalTrue;
    data['optionText1'] = this.optionText1;
    data['optionText2'] = this.optionText2;
    data['optionText3'] = this.optionText3;
    data['optionText4'] = this.optionText4;
    data['optionAssertionText1'] = this.optionAssertionText1;
    data['optionAssertionText2'] = this.optionAssertionText2;
    data['optionAssertionText3'] = this.optionAssertionText3;
    data['optionAssertionText4'] = this.optionAssertionText4;
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
    data['isLast'] = this.isLast;
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

class Subjects {
  String? sId;
  String? nameEn;

  Subjects({this.sId, this.nameEn});

  Subjects.fromJson(Map<String, dynamic> json) {
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

class Book {
  String? sId;
  String? nameEn;

  Book({this.sId, this.nameEn});

  Book.fromJson(Map<String, dynamic> json) {
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

class Lesson {
  String? sId;
  String? nameEn;

  Lesson({this.sId, this.nameEn});

  Lesson.fromJson(Map<String, dynamic> json) {
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

class Topic {
  String? sId;
  String? nameEn;

  Topic({this.sId, this.nameEn});

  Topic.fromJson(Map<String, dynamic> json) {
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
