class VideoClipModel {
  int? code;
  bool? status;
  String? message;
  VideoClipModelData? data;

  VideoClipModel({this.code, this.status, this.message, this.data});

  VideoClipModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    data = json['data'] != null ? new VideoClipModelData.fromJson(json['data']) : null;
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

class VideoClipModelData {
  String? sId;
  List<SubjectId>? subjectId;
  List<ClassId>? classId;
  List<LessonId>? lessonId;
  List<BookId>? bookId;
  String? topic;
 // List<Null>? wordMeanings;
  String? lessonDescription;
  String? readingDuration;
  String? lessonTextContent;
 // List<Null>? images;
  String? videoTutorialLink;
  bool? isTestRequired;
  String? createdBy;
  String? updatedBy;
  String? createdAt;
  String? updatedAt;
  int? iV;

  VideoClipModelData(
      {this.sId,
      this.subjectId,
      this.classId,
      this.lessonId,
      this.bookId,
      this.topic,
    //  this.wordMeanings,
      this.lessonDescription,
      this.readingDuration,
      this.lessonTextContent,
     // this.images,
      this.videoTutorialLink,
      this.isTestRequired,
      this.createdBy,
      this.updatedBy,
      this.createdAt,
      this.updatedAt,
      this.iV});

  VideoClipModelData.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    if (json['subjectId'] != null) {
      subjectId = <SubjectId>[];
      json['subjectId'].forEach((v) {
        subjectId!.add(new SubjectId.fromJson(v));
      });
    }
    if (json['classId'] != null) {
      classId = <ClassId>[];
      json['classId'].forEach((v) {
        classId!.add(new ClassId.fromJson(v));
      });
    }
    if (json['lessonId'] != null) {
      lessonId = <LessonId>[];
      json['lessonId'].forEach((v) {
        lessonId!.add(new LessonId.fromJson(v));
      });
    }
    if (json['bookId'] != null) {
      bookId = <BookId>[];
      json['bookId'].forEach((v) {
        bookId!.add(new BookId.fromJson(v));
      });
    }
    topic = json['topic'];
    // if (json['wordMeanings'] != null) {
    //   wordMeanings = <Null>[];
    //   json['wordMeanings'].forEach((v) {
    //     wordMeanings!.add(new Null.fromJson(v));
    //   });
    // }
    lessonDescription = json['lessonDescription'];
    readingDuration = json['readingDuration'];
    lessonTextContent = json['lessonTextContent'];
    // if (json['images'] != null) {
    //   images = <Null>[];
    //   json['images'].forEach((v) {
    //     images!.add(new Null.fromJson(v));
    //   });
    // }
    videoTutorialLink = json['videoTutorialLink'];
    isTestRequired = json['isTestRequired'];
    createdBy = json['createdBy'];
    updatedBy = json['updatedBy'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    iV = json['__v'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    if (this.subjectId != null) {
      data['subjectId'] = this.subjectId!.map((v) => v.toJson()).toList();
    }
    if (this.classId != null) {
      data['classId'] = this.classId!.map((v) => v.toJson()).toList();
    }
    if (this.lessonId != null) {
      data['lessonId'] = this.lessonId!.map((v) => v.toJson()).toList();
    }
    if (this.bookId != null) {
      data['bookId'] = this.bookId!.map((v) => v.toJson()).toList();
    }
    data['topic'] = this.topic;
    // if (this.wordMeanings != null) {
    //   data['wordMeanings'] = this.wordMeanings!.map((v) => v.toJson()).toList();
    // }
    data['lessonDescription'] = this.lessonDescription;
    data['readingDuration'] = this.readingDuration;
    data['lessonTextContent'] = this.lessonTextContent;
    // if (this.images != null) {
    //   data['images'] = this.images!.map((v) => v.toJson()).toList();
    // }
    data['videoTutorialLink'] = this.videoTutorialLink;
    data['isTestRequired'] = this.isTestRequired;
    data['createdBy'] = this.createdBy;
    data['updatedBy'] = this.updatedBy;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['__v'] = this.iV;
    return data;
  }
}

class SubjectId {
  String? sId;
  String? nameEn;
  String? description;
  bool? isActive;
  List<Images>? images;
  String? createdAt;
  String? updatedAt;
  int? code;
  int? iV;
  int? order;
  String? subjectCode;
  String? id;

  SubjectId(
      {this.sId,
      this.nameEn,
      this.description,
      this.isActive,
      this.images,
      this.createdAt,
      this.updatedAt,
      this.code,
      this.iV,
      this.order,
      this.subjectCode,
      this.id});

  SubjectId.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    nameEn = json['nameEn'];
    description = json['description'];
    isActive = json['isActive'];
    if (json['images'] != null) {
      images = <Images>[];
      json['images'].forEach((v) {
        images!.add(new Images.fromJson(v));
      });
    }
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    code = json['code'];
    iV = json['__v'];
    order = json['order'];
    subjectCode = json['subjectCode'];
    id = json['id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['nameEn'] = this.nameEn;
    data['description'] = this.description;
    data['isActive'] = this.isActive;
    if (this.images != null) {
      data['images'] = this.images!.map((v) => v.toJson()).toList();
    }
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['code'] = this.code;
    data['__v'] = this.iV;
    data['order'] = this.order;
    data['subjectCode'] = this.subjectCode;
    data['id'] = this.id;
    return data;
  }
}

class Images {
  String? url;
  String? name;
  String? sId;
  String? id;

  Images({this.url, this.name, this.sId, this.id});

  Images.fromJson(Map<String, dynamic> json) {
    url = json['url'];
    name = json['name'];
    sId = json['_id'];
    id = json['id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['url'] = this.url;
    data['name'] = this.name;
    data['_id'] = this.sId;
    data['id'] = this.id;
    return data;
  }
}

class ClassId {
  String? sId;
  String? nameEn;
  bool? isActive;
  int? order;
  String? createdBy;
  String? createdAt;
  String? updatedAt;
  String? classCode;
  int? iV;
  String? id;

  ClassId(
      {this.sId,
      this.nameEn,
      this.isActive,
      this.order,
      this.createdBy,
      this.createdAt,
      this.updatedAt,
      this.classCode,
      this.iV,
      this.id});

  ClassId.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    nameEn = json['nameEn'];
    isActive = json['isActive'];
    order = json['order'];
    createdBy = json['createdBy'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    classCode = json['classCode'];
    iV = json['__v'];
    id = json['id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['nameEn'] = this.nameEn;
    data['isActive'] = this.isActive;
    data['order'] = this.order;
    data['createdBy'] = this.createdBy;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['classCode'] = this.classCode;
    data['__v'] = this.iV;
    data['id'] = this.id;
    return data;
  }
}

class LessonId {
  String? sId;
  List<String>? subjectId;
  List<String>? classId;
  List<String>? bookId;
  bool? isActive;
  String? description;
  String? nameEn;
  String? createdAt;
  String? updatedAt;
  int? iV;
  String? id;

  LessonId(
      {this.sId,
      this.subjectId,
      this.classId,
      this.bookId,
      this.isActive,
      this.description,
      this.nameEn,
      this.createdAt,
      this.updatedAt,
      this.iV,
      this.id});

  LessonId.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    subjectId = json['subjectId'].cast<String>();
    classId = json['classId'].cast<String>();
    bookId = json['bookId'].cast<String>();
    isActive = json['isActive'];
    description = json['description'];
    nameEn = json['nameEn'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    iV = json['__v'];
    id = json['id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['subjectId'] = this.subjectId;
    data['classId'] = this.classId;
    data['bookId'] = this.bookId;
    data['isActive'] = this.isActive;
    data['description'] = this.description;
    data['nameEn'] = this.nameEn;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['__v'] = this.iV;
    data['id'] = this.id;
    return data;
  }
}

class BookId {
  String? sId;
  List<String>? subjectId;
  List<String>? classId;
  List<Images>? images;
  bool? isActive;
  String? description;
  String? nameEn;
  String? createdAt;
  String? updatedAt;
  int? iV;
  String? id;

  BookId(
      {this.sId,
      this.subjectId,
      this.classId,
      this.images,
      this.isActive,
      this.description,
      this.nameEn,
      this.createdAt,
      this.updatedAt,
      this.iV,
      this.id});

  BookId.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    subjectId = json['subjectId'].cast<String>();
    classId = json['classId'].cast<String>();
    if (json['images'] != null) {
      images = <Images>[];
      json['images'].forEach((v) {
        images!.add(new Images.fromJson(v));
      });
    }
    isActive = json['isActive'];
    description = json['description'];
    nameEn = json['nameEn'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    iV = json['__v'];
    id = json['id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['subjectId'] = this.subjectId;
    data['classId'] = this.classId;
    if (this.images != null) {
      data['images'] = this.images!.map((v) => v.toJson()).toList();
    }
    data['isActive'] = this.isActive;
    data['description'] = this.description;
    data['nameEn'] = this.nameEn;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['__v'] = this.iV;
    data['id'] = this.id;
    return data;
  }
}
