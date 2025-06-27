class InstrucModel {
  int? code;
  bool? status;
  String? message;
  IData? data;

  InstrucModel({this.code, this.status, this.message, this.data});

  InstrucModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    data = json['data'] != null ? new IData.fromJson(json['data']) : null;
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

class IData {
  List<English>? english;
  List<Hindi>? hindi;

  IData({this.english, this.hindi});

  IData.fromJson(Map<String, dynamic> json) {
    if (json['english'] != null) {
      english = <English>[];
      json['english'].forEach((v) {
        english!.add(new English.fromJson(v));
      });
    }
    if (json['hindi'] != null) {
      hindi = <Hindi>[];
      json['hindi'].forEach((v) {
        hindi!.add(new Hindi.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.english != null) {
      data['english'] = this.english!.map((v) => v.toJson()).toList();
    }
    if (this.hindi != null) {
      data['hindi'] = this.hindi!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class English {
  String? sId;
  String? instructionsName;
  String? description;
  String? type;
  List<Subjects>? subjects;
  List<Classes>? classes;
  String? createdAt;
  String? updatedAt;

  English(
      {this.sId,
      this.instructionsName,
      this.description,
      this.type,
      this.subjects,
      this.classes,
      this.createdAt,
      this.updatedAt});

  English.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    instructionsName = json['instructionsName'];
    description = json['description'];
    type = json['type'];
    if (json['subjects'] != null) {
      subjects = <Subjects>[];
      json['subjects'].forEach((v) {
        subjects!.add(new Subjects.fromJson(v));
      });
    }
    if (json['classes'] != null) {
      classes = <Classes>[];
      json['classes'].forEach((v) {
        classes!.add(new Classes.fromJson(v));
      });
    }
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['instructionsName'] = this.instructionsName;
    data['description'] = this.description;
    data['type'] = this.type;
    if (this.subjects != null) {
      data['subjects'] = this.subjects!.map((v) => v.toJson()).toList();
    }
    if (this.classes != null) {
      data['classes'] = this.classes!.map((v) => v.toJson()).toList();
    }
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
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

class Hindi {
  String? sId;
  String? instructionsName;
  String? hindi;
  String? type;
  List<Subjects>? subjects;
  List<Classes>? classes;
  String? createdAt;
  String? updatedAt;

  Hindi(
      {this.sId,
      this.instructionsName,
      this.hindi,
      this.type,
      this.subjects,
      this.classes,
      this.createdAt,
      this.updatedAt});

  Hindi.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    instructionsName = json['instructionsName'];
    hindi = json['hindi'];
    type = json['type'];
    if (json['subjects'] != null) {
      subjects = <Subjects>[];
      json['subjects'].forEach((v) {
        subjects!.add(new Subjects.fromJson(v));
      });
    }
    if (json['classes'] != null) {
      classes = <Classes>[];
      json['classes'].forEach((v) {
        classes!.add(new Classes.fromJson(v));
      });
    }
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['instructionsName'] = this.instructionsName;
    data['hindi'] = this.hindi;
    data['type'] = this.type;
    if (this.subjects != null) {
      data['subjects'] = this.subjects!.map((v) => v.toJson()).toList();
    }
    if (this.classes != null) {
      data['classes'] = this.classes!.map((v) => v.toJson()).toList();
    }
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
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
