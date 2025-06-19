class NotesModel {
  int? code;
  bool? status;
  String? message;
  List<NotesData>? data;

  NotesModel({this.code, this.status, this.message, this.data});

  NotesModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    if (json['data'] != null) {
      data = <NotesData>[];
      json['data'].forEach((v) {
        data!.add(new NotesData.fromJson(v));
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

class NotesData {
  String? sId;
  List<Notes>? notes;
  String? uploadedBy;
  List<ClassId>? classId;
  List<SubjectId>? subjectId;
  String? createdAt;
  int? iV;

  NotesData(
      {this.sId,
      this.notes,
      this.uploadedBy,
      this.classId,
      this.subjectId,
      this.createdAt,
      this.iV});

  NotesData.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    if (json['notes'] != null) {
      notes = <Notes>[];
      json['notes'].forEach((v) {
        notes!.add(new Notes.fromJson(v));
      });
    }
    uploadedBy = json['uploadedBy'];
    if (json['classId'] != null) {
      classId = <ClassId>[];
      json['classId'].forEach((v) {
        classId!.add(new ClassId.fromJson(v));
      });
    }
    if (json['subjectId'] != null) {
      subjectId = <SubjectId>[];
      json['subjectId'].forEach((v) {
        subjectId!.add(new SubjectId.fromJson(v));
      });
    }
    createdAt = json['createdAt'];
    iV = json['__v'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    if (this.notes != null) {
      data['notes'] = this.notes!.map((v) => v.toJson()).toList();
    }
    data['uploadedBy'] = this.uploadedBy;
    if (this.classId != null) {
      data['classId'] = this.classId!.map((v) => v.toJson()).toList();
    }
    if (this.subjectId != null) {
      data['subjectId'] = this.subjectId!.map((v) => v.toJson()).toList();
    }
    data['createdAt'] = this.createdAt;
    data['__v'] = this.iV;
    return data;
  }
}

class Notes {
  String? title;
  String? url;
  String? sId;
  String? uploadedAt;

  Notes({this.title, this.url, this.sId, this.uploadedAt});

  Notes.fromJson(Map<String, dynamic> json) {
    title = json['title'];
    url = json['url'];
    sId = json['_id'];
    uploadedAt = json['uploadedAt'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['title'] = this.title;
    data['url'] = this.url;
    data['_id'] = this.sId;
    data['uploadedAt'] = this.uploadedAt;
    return data;
  }
}

class ClassId {
  String? sId;
  String? nameEn;
  String? id;

  ClassId({this.sId, this.nameEn, this.id});

  ClassId.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    nameEn = json['nameEn'];
    id = json['id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['nameEn'] = this.nameEn;
    data['id'] = this.id;
    return data;
  }
}

class SubjectId {
  String? sId;
  String? nameEn;
  String? id;

  SubjectId({this.sId, this.nameEn, this.id});

  SubjectId.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    nameEn = json['nameEn'];
    id = json['id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['nameEn'] = this.nameEn;
    data['id'] = this.id;
    return data;
  }
}
